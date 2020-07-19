// Format source code maintaining indentation.
const $ = require('programmatic')

// Convert numbers and arrays to numbers to literals with hex literals.
const hex = require('./hex')

// Generate integer packing.
const pack = require('./pack')

// Determine necessary variables.
const { serialize: declare } = require('./declare')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate invocations of accumulators before conditionals.
const accumulations = require('./accumulations')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

const map = require('./map')

// Format source code maintaining indentation.
const join = require('./join')

function generate (packet, { require = null }) {
    let $step = 0, $i = -1, $I = -1, $$ = -1, surround = false

    const variables = declare(packet)

    // Locals are variables that are local to the switch statement's scope so
    // that they are set between invocations of the function, but they are also
    // local to the current serialization and do not overlap. Maybe we should
    // call them `leaves`, because you do not need to maintain a stack of them.

    //
    const locals = {}

    const accumulate = {
        accumulator: {},
        accumulated: [],
        buffered: [],
        variables: variables,
        packet: packet.name,
        direction: 'serialize'
    }

    function absent () {
        // TODO Can we have nothing instead?
        return $(`
            case ${$step++}:

                $step = ${$step}
        `)
    }

    function integer (path, field) {
        const endianness = field.endianness || 'big'
        const bytes = field.bits / 8
        const direction = field.endianness == 'big' ? '--' : '++'
        let bite = field.endianness == 'big' ? bytes - 1 : 0
        let stop = field.endianness == 'big' ? -1 : bytes
        const assign = field.fields
            ? pack(accumulate, packet, field, path, '$_')
            : field.lookup != null
                ? Array.isArray(field.lookup.values)
                    ? `$_ = $lookup[${field.lookup.index}].indexOf(${path})`
                    : `$_ = $lookup[${field.lookup.index}].reverse[${path}]`
                : `$_ = ${path}`
        const cast = field.bits > 32
            ? { suffix: 'n', from: 'Number', shift: '>>' }
            : { suffix: '', from: '', shift: '>>>' }
        const buffered = accumulate.buffered.map(buffered => buffered.source)
        const source = $(`
            case ${$step++}:

                $step = ${$step}
                $bite = ${bite}${cast.suffix}
                `, assign, `

            case ${$step++}:

                while ($bite != ${stop}${cast.suffix}) {
                    if ($start == $end) {
                        `, buffered.length != 0 ? buffered.join('\n') : null, `
                        return { start: $start, serialize: $serialize }
                    }
                    $buffer[$start++] = ${cast.from}($_ ${cast.shift} $bite * 8${cast.suffix} & 0xff${cast.suffix})
                    $bite${direction}
                }

        `)
        return source
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
                return $(`
                    case ${$step++}:

                        $step = ${$step}
                        $bite = 0
                        $_ = ${JSON.stringify(bytes)}

                    case ${$step++}:

                        while ($bite != ${literal.value.length >>> 1}) {
                            if ($start == $end) {
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

    function lengthEncoded (path, field) {
        const element = field.fields[0]
        surround = true
        const buffered = accumulate.buffered.length != 0 ? accumulate.buffered.map(buffered => {
            return $(`
                `, buffered.source, `
                $starts[${buffered.start}] = $start
            `)
        }).join('\n') : null
        if (element.type == 'buffer') {
            locals['copied'] = 0
            if (!element.concat) {
                locals['offset'] = 0
                locals['index'] = 0
                locals['length'] = 0
            }
            // New to you as of this writing is resetting `$index`. We're not
            // proagating an index from the best-foot-forward parser. Should we
            // call this incremental scope versus best-foot-forward scope?
            return element.concat
            ? $(`
                `, map(dispatch, path + '.length', field.encoding), `

                case ${$step++}: {

                    const $bytes = Math.min($end - $start, ${path}.length - $copied)
                    ${path}.copy($buffer, $start, $copied, $copied + $bytes)
                    $copied += $bytes
                    $start += $bytes

                    if ($copied != ${path}.length) {
                        `, buffered, `
                        return { start: $start, serialize: $serialize }
                    }

                    $copied = 0

                    $step = ${$step}

                }
            `)
            : $(`
                case ${$step++}:

                    $length = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)

                    $step = ${$step}

                `, map(dispatch, '$length', field.encoding), `

                    $_ = 0

                case ${$step++}: {

                    $step = ${$step - 1}

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
                            `, buffered, `
                            return { start: $start, serialize: $serialize }
                        }
                    }

                    $index = 0
                    $offset = 0
                    $copied = 0

                    $step = ${$step}

                }
            `)
        }
        const encoding = map(dispatch, path + '.length', field.encoding)
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
    function copy (path, element, buffered, inline = null) {
        // If we have an array of buffers, we need a loop index and a variable
        // to track the offset in the specific buffer.
        let i
        if (!element.concat) {
            locals['offset'] = 0
            locals['length'] = 0
            locals['index'] = 0
        }
        const source = element.concat
        // Copy the single buffer using copy.
        ? $(`
            case ${$step++}:

                $_ = 0
                $I[${$I + 1}] = `, inline, `

            case ${$step++}: {

                    $step = ${$step - 1}

                    const length = Math.min($end - $start, ${path}.length - $_)
                    ${path}.copy($buffer, $start, $_, $_ + length)
                    $start += length
                    $_ += length

                    if ($_ != ${path}.length) {
                        `, buffered, `
                        return { start: $start, serialize: $serialize }
                    }

                    $step = ${$step}

                }
        `)
        // Loop through an array of buffers copying to the serialization
        // buffer using `Buffer.copy()`. Need to track the index of the
        // current buffer in the array the offset in the current buffer.
        : $(`
            case ${$step++}:

                $_ = 0
                $length = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)
                $I[${$I + 1}] = `, inline, `

            case ${$step++}: {

                $step = ${$step - 1}

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
                        `, buffered, `
                        return { start: $start, serialize: $serialize }
                    }
                }

                $index = 0
                $offset = 0

                $step = ${$step}

            }
        `)
        if (element.concat) {
            i--
        }
        return source
    }

    function terminated (path, field) {
        surround = true
        const buffered = accumulate.buffered.length != 0
            ? accumulate.buffered.map(buffered => {
                return $(`
                    `, buffered.source, `
                    $starts[${buffered.start}] = $start
                `)
            }).join('\n') : null
        function terminate () {
            return join(field.terminator.map(bite => {
                return $(`
                    case ${$step++}:

                        if ($start == $end) {
                            `, buffered, `
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = ${hex(bite)}

                        $step = ${$step}
                `)
            }))
        }
        const element = field.fields[0]
        if (element.type == 'buffer') {
            const source = $(`
                `, copy(path, element, buffered), `

                `, terminate(), `
            `)
            return source
        }
        $i++
        const init = $step
        const again = ++$step
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
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
        // Generate any buffered function calls to process the buffer if we
        // reach the end of the buffer.
        const buffered = accumulate.buffered.length != 0
                       ? accumulate.buffered.map(buffered => buffered.source).join('\n')
                       : null
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
                return `$step = ${$step}`
            }
            // First step of padding.
            const redo = $step
            // First step of next field.
            const done = $step + field.pad.length
            // Assign the padding byte to the buffer, break if we've reached the
            // end of the buffer.
            const pad = join(field.pad.map(bite => {
                return $(`
                        $step = ${$step}

                    case ${$step++}:

                        if ($start == $end) {
                            `, buffered, `
                            return { start: $start, serialize: $serialize }
                        }

                        if ($_++ == ${full}) {
                            $step = ${done}
                            continue
                        }

                        $buffer[$start++] = ${hex(bite)}

                        $step = ${$step}
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
            const inline = field.calculated
                ? inliner(accumulate, path, [ field.length ], []).inlined.shift()
                : null
            if (field.calculated) {
                $I--
            }
            const source = copy(path, element, buffered, inline)
            // If there is no padding, we are done.
            if (field.pad.length == 0) {
                return source
            }
            // We can use `Buffer.fill()` for single-byte padding.
            // TODO Unnecessary `$_` assignment.
            if (field.pad.length == 1) {
                return $(`
                    `, source, `

                    case ${$step++}:

                        ${length} = `, inline, `
                        $_ = ${length} - $_

                        $step = ${$step}

                    case ${$step++}: {

                        const length = Math.min($end - $start, $_)
                        $buffer.fill(${hex(field.pad[0])}, $start, $start + length)
                        $start += length
                        $_ -= length

                        if ($_ != 0) {
                            return { start: $start, serialize: $serialize }
                        }

                        $step = ${$step}

                    }
                `)
            }
            // We use bite-by-bite padfor multi-byte padding.
            return $(`
                `, source, `

                `, pad(null, field.calculated ? `${length} * ${element.bits >>> 3}` : field.bits / 8), `
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
            const inline = inliner(accumulate, path, [ field.length ], [])
            const element = field.fields[field.fields.length - 1]
            if (field.pad.length != 0) {
                source = $(`
                    case ${init}:

                        ${i} = 0
                        ${length} = `, inline.inlined.shift(), `

                        $step = ${redo}

                    `, map(dispatch, `${path}[${i}]`, field.fields), `
                        if (++${i} != ${path}.length) {
                            $step = ${redo}
                            continue
                        }

                    `, pad(`$_ = ${i} * ${element.bits >>> 3}`, `${length} * ${element.bits >>> 3}`), `
                `)
            } else {
                source = $(`
                    case ${init}:

                        ${i} = 0
                        ${length} = `, inline.inlined.shift(), `

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

                `, pad(`$_ = ${i} * ${element.bits >>> 3}`), `
            `)
        }
        // Release the array index from the array of indices.
        $i--
        return source
    }

    function inline (path, field) {
        const before = field.before.length != 0 ? function () {
            const register = `$$[${++$$}]`
            const inline = inliner(accumulate, path, field.before, [
                path, register
            ], register)
            if (
                inline.inlined.length == 0 &&
                inline.buffered.start == inline.buffered.end
            ) {
                return {
                    path: path,
                    source: null,
                    buffered: inline.buffered
                }
            }
            const starts = []
            for (let i = inline.buffered.start, I = inline.buffered.end; i < I; i++) {
                starts.push(`$starts[${i}] = $start`)
            }
            return {
                path: inline.register,
                source: $(`
                    case ${$step++}:

                        `, join(inline.inlined), `
                        `, starts.length != 0 ? starts.join('\n') : null, `
                `),
                buffered: inline.buffered
            }
        } () : {
            path: path,
            source: null,
            buffered: {
                start: accumulate.buffered.length,
                end: accumulate.buffered.length
            }
        }
        if (before.path[0] != '$') {
            $$--
        }
        const source =  map(dispatch, before.path, field.fields)
        const buffered = accumulate.buffered
            .splice(0, before.buffered.end)
            .map(buffered => {
                return buffered.source
            })
        if (before.path[0] == '$') {
            $$--
        }
        return $(`
            `, before.source, -1, `

            `, source, `

                `, -1, buffered.length != 0 ? buffered.join('\n') : null, `
        `)
    }

    function conditional (path, field) {
        surround = true
        const invocations = accumulations({
            functions: field.serialize.conditions.map(condition => condition.test),
            accumulate: accumulate
        })
        const start = $step++
        const steps = []
        for (const condition of field.serialize.conditions) {
            steps.push({
                step: $step,
                source: join(condition.fields.map(field => dispatch(path, field)))
            })
        }
        let ladder = '', keywords = 'if'
        for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
            const condition = field.serialize.conditions[i]
            ladder = condition.test != null ? function () {
                const registers = field.split ? [ path ] : []
                const f = inliner(accumulate, path, [ condition.test ], registers)
                return $(`
                    `, ladder, `${keywords} (`, f.inlined.shift(), `) {
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

    function switched (path, field) {
        surround = true
        const start = $step++
        const cases = []
        const steps = []
        for (const when of field.cases) {
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                    $step = ${$step}
                    continue
            `))
            steps.push(join(when.fields.map(field => dispatch(path, field))))
        }
        const inlined = inliner(accumulate, path, [ field.select ], [])
        const invocations = accumulations({
            functions: [ field.select ],
            accumulate: accumulate
        })
        const select = field.stringify
            ? `String(${inlined.inlined.shift()})`
            : inlined.inlined.shift()
        // TODO Slicing here is because of who writes the next step, which seems
        // to be somewhat confused.
        return $(`
            case ${start}:

                `, invocations, -1, `

                switch (`, select, `) {
                `, join(cases), `
                }

            `, join([].concat(steps.slice(steps, steps.length - 1).map(step => $(`
                `, step, `
                    $step = ${$step}
                    continue
            `)), steps.slice(steps.length -1))), `
        `)
    }

    function accumulator (path, field) {
        return $(`
            case ${$step++}:

                `, accumulatorer(accumulate, field), `

            `, map(dispatch, path, field.fields), `
        `)
    }

    function dispatch (path, packet) {
        switch (packet.type) {
        case 'structure':
            return join(packet.fields.map(field => {
                const source = dispatch(path + field.dotted, field)
                return $(`
                    `, source, `
                `)
            }))
        case 'accumulator':
            return accumulator(path, packet)
        case 'switch':
            return switched(path, packet)
        case 'conditional':
            return conditional(path, packet)
        case 'inline':
            return inline(path, packet)
        case 'fixed':
            return fixed(path, packet)
        case 'terminated':
            return terminated(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'literal':
            return literal(path, packet)
        case 'buffer':
        case 'bigint':
        case 'integer':
            // TODO This will not include the final step, we keep it off for the
            // looping constructs.
            return integer(path, packet)
        case 'absent':
            return absent(path, packet)
        }
    }

    let source = $(`
        switch ($step) {
        `, dispatch(packet.name, packet), `

            $step = ${$step}

        case ${$step}:

            break

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
        step: '$step = 0',
        i: '$i = []',
        I: '$I = []',
        stack: '$$ = []',
        accumulator: '$accumulator = {}',
        starts: '$starts = []'
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

    variables.register = true
    variables.bite = true

    const lets = Object.keys(declarations)
                       .filter(key => variables[key])
                       .map(key => declarations[key])
                       .concat(Object.keys(locals).map(name => `$${name} = ${locals[name]}`))

    return $(`
        serializers.inc.${packet.name} = function () {
            `, requires, -1, `

            return function (${signature.join(', ')}) {
                let ${lets.join(', ')}

                return function $serialize ($buffer, $start, $end) {
                    `, restart, -1, `

                    `, source, `

                    return { start: $start, serialize: null }
                }
            }
        } ()
    `)
}

module.exports = function (definition, options) {
    return join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet, options)))
}
