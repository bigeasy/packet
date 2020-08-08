// Node.js API.
const util = require('util')
const assert = require('assert')

// Generate user functions and accumulators.
const Inline = require('./inline.js')

// Determine if an integer serialization should be unrolled.
const { serialize: homogeneous } = require('./homogeneous')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Convert numbers and arrays to numbers to literals with hex literals.
const hex = require('./hex')

// Generate integer packing.
const pack = require('./pack')

// Determine necessary variables.
const { serialize: declare } = require('./declare')

// Generate required modules and functions.
const required = require('./required')

const map = require('./map')

// Format source code maintaining indentation.
const join = require('./join')

function generate (packet, { require = null }) {
    let $step = 0, $i = -1, $I = -1, $$ = -1, surround = false

    const { variables , accumulators, parameters } = declare(packet)

    // Locals are variables that are local to the switch statement's scope so
    // that they are set between invocations of the function, but they are also
    // local to the current serialization and do not overlap. Maybe we should
    // call them `leaves`, because you do not need to maintain a stack of them.

    //
    const locals = {}

    const inliner = Inline({
        packet, variables, accumulators, parameters,
        direction: 'serialize'
    })

    function absent () {
        // TODO Can we have nothing instead?
        return `case ${$step++}:`
    }
    //

    // Convert an object property to value to an integer. This generated source
    // is common to both rolled and unrolled `number` and `BigInt`
    // serialization. Convert the object property value if it is a lookup value
    // or a packed integer.
    function convert (path, field) {
        variables.register = true
        return field.fields
            ? pack(inliner, field, path)
            : field.lookup != null
                ? Array.isArray(field.lookup.values)
                    ? `$_ = $lookup[${field.lookup.index}].indexOf(${path})`
                    : `$_ = $lookup[${field.lookup.index}].reverse[${path}]`
                : `$_ = ${path}`
    }
    //

    // Serialize a `number` or `BigInt` integer using a loop to advance to the
    // next byte. We use this when the bit size and upper bits are the same for
    // each byte which is the common case &mdash; use all 8 bits, set no bytes.
    function rolled (path, field, bite, stop, write) {
        variables.bite = true
        const direction = field.endianness == 'big' ? '--' : '++'
        return $(`
            case ${$step++}:

                $bite = ${bite}
                `, convert(path, field), `

            case ${$step++}:

                while ($bite != ${stop}) {
                    if ($start == $end) {
                        $step = ${$step - 1}
                        `, inliner.exit(), `
                        return { start: $start, serialize: $serialize }
                    }
                    $buffer[$start++] = ${write}
                    $bite${direction}
                }
        `)
    }
    //

    // Serialize an integer or `BigInt` using a step for each byte. We use this
    // when the bit size and upper bits are **not** the same for each byte, when
    // we are packing an integer into bytes that might use the upper bytes as
    // flags as in the case some variable length integer encodings.
    function unrolled (path, field, writes) {
        const initialize = $(`
            case ${$step++}:

                `, convert(path, field), `
        `)
        const steps = join(writes.map(write => {
            return $(`
                case ${$step++}:

                    if ($start == $end) {
                        $step = ${$step - 1}
                        `, inliner.exit(), `
                        return { start: $start, serialize: $serialize }
                    }

                    $buffer[$start++] = ${write}
            `)
        }))
        return $(`
            `, initialize, `

            `, steps, `
        `)
    }
    //

    // Serialize a `number` as an integer.
    function integer (path, field) {
        if (homogeneous(field)) {
            const bytes = field.bits / 8
            const bite = field.endianness == 'big' ? bytes - 1 : 0
            const stop = field.endianness == 'big' ? -1 : bytes
            const { size, mask, upper } = field.bytes[0]
            const shifted = $(`
                $_ >>> $bite * ${size} & ${hex(mask)}
            `)
            const write = field.bytes[0].upper != 0 ? `(${shifted}) | ${hex(upper)}` : shifted
            return rolled(path, field, bite, stop, write)
        }
        return unrolled(path, field, field.bytes.map(({ mask, shift, upper }) => {
            const shifted = `$_ >>> ${shift} & ${hex(mask)}`
            return upper != 0 ? `${shifted} | ${hex(upper)}` : shifted
        }))
    }
    //

    // Serialize a `BigInt` as an integer. We need a separate implementation for
    // `BigInt` because `BigInt` math works only with `BigInt` values with no
    // implicit conversions.
    function bigint (path, field) {
        if (homogeneous(field)) {
            const bytes = field.bits / 8
            const bite = field.endianness == 'big' ? bytes - 1 : 0
            const stop = field.endianness == 'big' ? -1 : bytes
            const { size, mask, upper } = field.bytes[0]
            const shifted = $(`
                Number($_ >> $bite * ${size}n & ${hex(mask)}n)
            `)
            const write = field.bytes[0].upper != 0 ? `(${shifted}) | ${hex(upper)}` : shifted
            return rolled(path, field, `${bite}n`, `${stop}n`, write)
        }
        return unrolled(path, field, field.bytes.map(({ mask, shift, upper }) => {
            const shifted = `Number($_ >> ${shift}n & ${hex(mask)}n)`
            return upper != 0 ? `${shifted} | ${hex(upper)}` : shifted
        }))
    }

    function literal (path, field) {
        function write (literal) {
            const bytes = []
            for (let i = 0, I = literal.value.length; i < I; i += 2) {
                bytes.push(parseInt(literal.value.substring(i, i + 2), 16))
            }
            switch (literal.repeat) {
            case 0:
                return null
            case 1:
                variables.register = true
                return $(`
                    case ${$step++}:

                        $bite = 0
                        $_ = ${util.inspect(bytes)}

                    case ${$step++}:

                        while ($bite != ${literal.value.length >>> 1}) {
                            if ($start == $end) {
                                $step = ${$step - 1}
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }

                `)
            case 2: {
                    surround = true
                    const redo = $step
                    return $(`
                        case ${$step++}:

                            $i[${$i + 1}] = 0

                        `, write({ ...literal, repeat: 1 }), `

                        case ${$step++}:

                            if (++$i[${$i + 1}] < ${literal.repeat}) {
                                $step = ${redo + 1}
                                continue
                            }
                    `)
                }
            }
        }
        return $(`
            `, write(field.before), -1, `

            `, map(dispatch, path, field.fields), `

            `, -1, write(field.after), `
        `)
    }

    function inline (path, field) {
        const inline = inliner.inline(path, field.before, 'serialize')
        const inlined = inline.inlined != null || inline.starts != null
            ? $(`
                case ${$step++}:

                    `, inline.inlined, `
                    `, inline.starts, `
            `)
            : null
        return $(`
            `, inlined, -1, `

            `, map(dispatch, inline.path, field.fields), `

                `, -1, inliner.pop(), `
        `)
    }

    function accumulator (path, field) {
        return $(`
            case ${$step++}:

                `, inliner.accumulator(field), `

            `, map(dispatch, path, field.fields), `
        `)
    }

    function lengthEncoded (path, field) {
        const element = field.fields[0]
        surround = true
        if (element.type == 'buffer') {
            locals['copied'] = 0
            // New to you as of this writing is resetting `$index`. We're not
            // proagating an index from the best-foot-forward parser. Should we
            // call this incremental scope versus best-foot-forward scope?
            if (element.concat) {
                return $(`
                    `, map(dispatch, `${path}.length`, field.encoding), `

                    case ${$step++}: {

                        const $bytes = Math.min($end - $start, ${path}.length - $copied)
                        ${path}.copy($buffer, $start, $copied, $copied + $bytes)
                        $copied += $bytes
                        $start += $bytes

                        if ($copied != ${path}.length) {
                            $step = ${$step - 1}
                            `, inliner.exit(), `
                            return { start: $start, serialize: $serialize }
                        }

                        $copied = 0

                    }
                `)
            }
            variables.register = true
            locals['offset'] = 0
            locals['index'] = 0
            locals['length'] = 0
            return $(`
                case ${$step++}:

                    $length = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)

                `, map(dispatch, '$length', field.encoding), `

                    $_ = 0

                case ${$step++}: {

                    for (;;) {
                        const $bytes = Math.min($end - $start, ${path}[$index].length - $offset)
                        ${path}[$index].copy($buffer, $start, $offset, $offset + $bytes)
                        $copied += $bytes
                        $offset += $bytes
                        $start += $bytes

                        if ($offset == ${path}[$index].length) {
                            $index++
                            $offset = 0
                        }

                        if ($copied == $length) {
                            break
                        }

                        if ($start == $end) {
                            $step = ${$step - 1}
                            `, inliner.exit(), `
                            return { start: $start, serialize: $serialize }
                        }
                    }

                    $index = 0
                    $offset = 0
                    $copied = 0

                }
            `)
        }
        const encoding = map(dispatch, `${path}.length`, field.encoding)
        const redo = $step
        const i = `$i[${++$i}]`
        const source = $(`
            `, encoding, `
                ${i} = 0

            `, map(dispatch, `${path}[${i}]`, field.fields), `

                if (++${i} != ${path}.length) {
                    $step = ${redo}
                    continue
                }
        `)
        $i--
        return source
    }
    //

    // A buffer copy shared by terminated and fixed arrays.

    //
    function copy (path, element, calculation = null) {
        variables.register = true
        if (element.concat) {
            // Copy the single buffer using copy.
            return $(`
                case ${$step++}:

                    $_ = 0
                    $I[${$I + 1}] = `, calculation, `

                case ${$step++}: {

                        const length = Math.min($end - $start, ${path}.length - $_)
                        ${path}.copy($buffer, $start, $_, $_ + length)
                        $start += length
                        $_ += length

                        if ($_ != ${path}.length) {
                            $step = ${$step - 1}
                            `, inliner.exit(), `
                            return { start: $start, serialize: $serialize }
                        }

                    }
            `)
        }
        locals['offset'] = 0
        locals['length'] = 0
        locals['index'] = 0
        // Loop through an array of buffers copying to the serialization
        // buffer using `Buffer.copy()`. Need to track the index of the
        // current buffer in the array the offset in the current buffer.
        return $(`
            case ${$step++}:

                $_ = 0
                $length = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)
                $I[${$I + 1}] = `, calculation, `

            case ${$step++}: {

                for (;;) {
                    const $bytes = Math.min($end - $start, ${path}[$index].length - $offset)
                    ${path}[$index].copy($buffer, $start, $offset, $offset + $bytes)
                    $offset += $bytes
                    $start += $bytes
                    $_ += $bytes

                    if ($offset == ${path}[$index].length) {
                        $index++
                        $offset = 0
                    }

                    if ($_ == $length) {
                        break
                    }

                    if ($start == $end) {
                        $step = ${$step - 1}
                        `, inliner.exit(), `
                        return { start: $start, serialize: $serialize }
                    }
                }

                $index = 0
                $offset = 0

            }
        `)
    }

    function terminated (path, field) {
        surround = true
        function terminate () {
            return join(field.terminator.map(bite => {
                return $(`
                    case ${$step++}:

                        if ($start == $end) {
                            $step = ${$step - 1}
                            `, inliner.exit(), `
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = ${hex(bite)}
                `)
            }))
        }
        const element = field.fields[0]
        if (element.type == 'buffer') {
            const source = $(`
                `, copy(path, element), `

                `, terminate(), `
            `)
            return source
        }
        $i++
        const init = $step
        const again = ++$step
        const i = `$i[${$i}]`
        const looped = map(dispatch, `${path}[${i}]`, field.fields)
        const done = $step
        const source = $(`
            case ${init}:

                ${i} = 0
                $step = ${again}

            `, looped, `
                if (++${i} != ${path}.length) {
                    $step = ${again}
                    continue
                }

                $step = ${done}

            `, terminate(), `

            case ${$step++}:
        `)
        $i--
        return source
    }

    function fixed (path, field) {
        // TODO In all fixed calculated everywhere, ensure you decrement.
        const length = field.calculated  ? `$I[${++$I}]` : field.length
        // We will be looping.
        surround = true
        // Get the element type contained by the array.
        const element = field.fields[field.fields.length - 1]
        // The byte-by-byte implementation of pad is used by byte-by-byte, of
        // course, and buffers when the terminator is multi-byte.
        //
        // **TODO** Seems like pad should use `fill` in both cases and use as
        // `fill` as much as possible when multi-byte, track the offsets, etc.
        // Would worry about it more if fixed buffers weren't such a goofball
        // case. It would be slice remainder copy, fill, slice remainder copy
        // each time.
        //
        // **TODO** Lengths seem off, array length and not byte length? I've
        // added the multiplication, let's see if it breaks.
        function pad (assignment = null, full = field.bits / 8) {
            if (field.pad.length == 0) {
                return null
            }
            variables.register = true
            // First step of padding.
            const redo = $step
            // First step of next field.
            const done = $step + field.pad.length
            // Assign the padding byte to the buffer, break if we've reached the
            // end of the buffer.
            const pad = join(field.pad.map(bite => {
                return $(`
                    case ${$step++}:

                        if ($start == $end) {
                            $step = ${$step - 1}
                            `, inliner.exit(), `
                            return { start: $start, serialize: $serialize }
                        }

                        if ($_++ == ${full}) {
                            $step = ${done}
                            continue
                        }

                        $buffer[$start++] = ${hex(bite)}
                `)
            }))
            // Repeat the padding fill if we've not filled the buffer
            // TODO Test on redo is unnecessary, we would have jumped to done.
            return $(`
                    `, assignment, -1, `

                `, pad, `

                    if ($_ != ${full}) {
                        $step = ${redo}
                        continue
                    }
            `)
        }
        //

        // If a buffer, use `copy` and `fill`.

        //
        if (element.type == 'buffer') {
            const calculation = field.calculated ? inliner.test(path, field.length) : null
            if (field.calculated) {
                $I--
            }
            const source = copy(path, element, calculation)
            // If there is no padding, we are done.
            if (field.pad.length == 0) {
                return source
            }
            // TODO Oh, no! We're running calculation twice! Once in `copy` and
            // once here. That ain't right.
            // We can use `Buffer.fill()` for single-byte padding.
            // TODO Unnecessary `$_` assignment.
            if (field.pad.length == 1) {
                return $(`
                    `, source, `

                    case ${$step++}:

                        ${length} = `, calculation, `
                        $_ = ${length} - $_

                    case ${$step++}: {

                        const length = Math.min($end - $start, $_)
                        $buffer.fill(${hex(field.pad[0])}, $start, $start + length)
                        $start += length
                        $_ -= length

                        if ($_ != 0) {
                            $step = ${$step - 1}
                            return { start: $start, serialize: $serialize }
                        }

                    }
                `)
            }
            // We use bite-by-bite padfor multi-byte padding.
            return $(`
                `, source, `

                `, -1, pad(null, field.calculated ? `${length} * ${element.bits >>> 3}` : field.bits / 8), `
            `)
        }
        // Obtain a next index from the index array.
        const i = `$i[${++$i}]`
        // Initialization step.
        const init = $step++
        // Start of element fields, loop reset.
        const redo = $step
        // Put it all together.
        let source = null
        if (field.calculated) {
            const test = inliner.test(path, field.length)
            const element = field.fields[field.fields.length - 1]
            if (field.pad.length != 0) {
                source = $(`
                    case ${init}:

                        ${i} = 0
                        ${length} = `, test, `

                        $step = ${redo}

                    `, map(dispatch, `${path}[${i}]`, field.fields), `
                        if (++${i} != ${path}.length) {
                            $step = ${redo}
                            continue
                        }

                    `, -1, pad(`$_ = ${i} * ${element.bits >>> 3}`, `${length} * ${element.bits >>> 3}`), `
                `)
            } else {
                source = $(`
                    case ${init}:

                        ${i} = 0
                        ${length} = `, test, `

                        $step = ${redo}

                    `, map(dispatch, `${path}[${i}]`, field.fields), `
                        if (++${i} != ${path}.length) {
                            $step = ${redo}
                            continue
                        }
                `)
            }
            $I--
        } else {
            source = $(`
                case ${init}:

                    ${i} = 0
                    $step = ${redo}

                `, map(dispatch, `${path}[${i}]`, field.fields), `
                    if (++${i} != ${path}.length) {
                        $step = ${redo}
                        continue
                    }

                `, -1, pad(`$_ = ${i} * ${element.bits >>> 3}`), `
            `)
        }
        // Release the array index from the array of indices.
        $i--
        return source
    }

    function switched (path, field) {
        surround = true
        const start = $step++
        const cases = []
        const steps = []
        for (const when of field.cases) {
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${util.inspect(when.value)}`}:

                    $step = ${$step}
                    continue
            `))
            steps.push(map(dispatch, path, when.fields))
        }
        const invocations = inliner.accumulations([ field.select ])
        // TODO Slicing here is because of who writes the next step, which seems
        // to be somewhat confused.
        return $(`
            case ${start}:

                `, invocations, -1, `

                switch (`, inliner.test(path, field.select), `) {
                `, join(cases), `
                }

            `, join([].concat(steps.slice(steps, steps.length - 1).map(step => $(`
                `, step, `
                    $step = ${$step}
                    continue
            `)), steps.slice(steps.length -1))), `
        `)
    }

    function conditional (path, field) {
        surround = true
        const tests = field.serialize.conditions.filter(condition => condition.test != null)
                                                .map(condition => condition.test)
        const invocations = inliner.accumulations(tests)
        const start = $step++
        const steps = []
        for (const condition of field.serialize.conditions) {
            steps.push({
                step: $step,
                source: map(dispatch, path, condition.fields)
            })
        }
        let ladder = '', keywords = 'if'
        for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
            const condition = field.serialize.conditions[i]
            ladder = condition.test != null ? function () {
                const signature = field.split ? [ path ] : []
                const test = inliner.test(path, condition.test, signature)
                return $(`
                    `, ladder, `${keywords} (`, test, `) {
                        $step = ${steps[i].step}
                        continue
                    }
                `)
            } () : $(`
                `, ladder, ` else {
                    $step = ${steps[i].step}
                    continue
                }
            `)
            keywords = ' else if'
        }
        const done = $(`
            $step = ${$step}
            continue
        `)
        // TODO Instead of choping the literal source, prevent adding the
        // trailing line, maybe. Or maybe this is best.
        return $(`
            case ${start}:

                `, invocations, -1, `

                `, ladder, `

            `, join(steps.map((step, i) => {
                return $(`
                    `, step.source, `

                        `, -1, steps.length - 1 != i ? done : null, `
                `)
            })), `
        `)
        return source
    }

    function dispatch (path, field) {
        switch (field.type) {
        case 'structure':
            return map(dispatch, path, field.fields)
        case 'conditional':
            return conditional(path, field)
        case 'switch':
            return switched(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'terminated':
            return terminated(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'accumulator':
            return accumulator(path, field)
        case 'inline':
            return inline(path, field)
        case 'literal':
            return literal(path, field)
        case 'bigint':
            return bigint(path, field)
        case 'integer':
            return integer(path, field)
        case 'absent':
            return absent(path, field)
        }
    }

    function generate () {
        let source = $(`
            switch ($step) {
            `, dispatch(packet.name, packet), `

            }
        `)

        if (surround) {
            source = $(`
                for (;;) {
                    `, source, `

                    break
                }
            `)
        }

        const signatories = {
            packet: `${packet.name}`,
            parameters: null,
            step: '$step = 0',
            i: '$i = []',
            I: '$I = []',
            stack: '$$ = []',
            accumulator: '$accumulator = {}',
            starts: '$starts = []'
        }

        if (Object.keys(parameters).length != 0) {
            const properties = []
            for (const parameter in parameters) {
                properties.push(`${parameter} = ${parameters[parameter]}`)
            }
            variables.parameters = true
            signatories.parameters = $(`
                {
                    `, properties.join(', '), `
                } = {}
            `)
        }

        const signature = Object.keys(signatories)
                                .filter(key => variables[key])
                                .map(key => signatories[key])

        const requires = required(require)

        const restart = variables.starts ? $(`
            if ($restart) {
                for (let $j = 0; $j < $starts.length; $j++) {
                    $starts[$j] = $start
                }
            }
            $restart = true
        `) : null

        const declarations = {
            register: '$_',
            bite: '$bite',
            starts: '$restart = false',
            length: '$length = 0'
        }

        const lets = Object.keys(declarations)
                           .filter(key => variables[key])
                           .map(key => declarations[key])
                           .concat(Object.keys(locals).map(name => `$${name} = ${locals[name]}`))

        return $(`
            function () {
                `, requires, -1, `

                return function (`, signature.join(', '), `) {
                    let `, lets.length != 0 ? lets.join(', ') : null, -1, `

                    return function $serialize ($buffer, $start, $end) {
                        `, restart, -1, `

                        `, source, `

                        return { start: $start, serialize: null }
                    }
                }
            } ()
        `)
    }

    return generate()
}

module.exports = function (definition, options) {
    // TODO Is the defensive copy still necessary?
    const source = JSON.parse(JSON.stringify(definition)).map(packet => {
        const source = generate(packet, options)
        return $(`
            ${packet.name}: `, source, `
        `)
    })
    return $(`
        {
            `, source.join(',\n'), `
        }
    `)
}
