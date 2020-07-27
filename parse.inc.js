// Node.js API.
const util = require('util')
const { inspect } = require('util')

// Convert numbers and arrays to numbers to literals with hex literals.
const hex = require('./hex')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate literal object construction.
const vivify = require('./vivify')

// Generate two's compliment conversion.
const unsign = require('./fiddle/unsign')

// Generate integer unpacking.
const unpack = require('./unpack')

// Determine necessary variables.
const { parse: declare } = require('./declare')

// Generate inline function source.
const Inliner = require('./inline_')

// Generate required modules and functions.
const required = require('./required')

// Format source code maintaining indentation.
const join = require('./join')

const map = require('./map')

//

// Generate an incremental parser from our AST.

//
function generate (packet, { require = null }) {
    // Whether or not to surround the switch statement with a forever loop.
    let surround = false

    // Current step being generated.
    let $step = 0

    // Current position in the array of array indices.
    let $i = -1

    // Current array length for length encoded arrays.
    let $I = -1

    // Map of parser scoped variable definitions to their initialization values.
    const locals = {}

    // Traverse the AST looking for all the variables that will be passed into
    // in this parser from a best-foot-forward parse, all the accumulators that
    // will be decalared, and the set of named parameters passed to the parser
    // from outside the parser on construction.
    const { variables, accumulators, parameters } = declare(packet)

    // An object that tracks the declaration of accumulators, whether or not
    // they are accumulating buffer contents, as well providing the `inliner`
    // function with the state necessary to generate named function invocations.
    const inliner = new Inliner({
        packet, variables, accumulators, parameters,
        direction: 'parse'
    })
    //

    // Generate an *absent* field by setting the property to `null` or an empty
    // array `[]`.

    //
    function absent (path, field) {
        return $(`
            case ${$step++}:

                ${path} = ${util.inspect(field.value)}

                $step = ${$step}
        `)
    }
    //

    // Parse an integer.

    //
    function integer (path, field) {
        const bytes = field.bits / 8
        // Special case for single byte which is a single step.
        if (bytes == 1 && field.fields == null && field.lookup == null) {
            return $(`
                case ${$step++}:

                    $step = ${$step}

                case ${$step++}:

                    if ($start == $end) {
                        `, inliner.exit(), `
                        return { start: $start, object: null, parse: $parse }
                    }

                    ${path} = $buffer[$start++]

            `)
        }
        const start = field.endianness == 'big' ? bytes - 1 : 0
        const stop = field.endianness == 'big' ? -1 : bytes
        const direction = field.endianness == 'big' ?  '--' : '++'
        // **TODO** This appears to proibit using a two's compliment value as a
        // lookup value, which is probably okay, since how would you lookup
        // negative values. Well, you could use a map, so...
        const assign = field.fields
            ? unpack(inliner, packet, path, field, '$_')
            : field.compliment
                ? `${path} = ${unsign('$_', field.bits)}`
                : field.lookup != null
                    ? Array.isArray(field.lookup.values)
                        ? `${path} = $lookup[${field.lookup.index}][$_]`
                        : `${path} = $lookup[${field.lookup.index}].forward[$_]`
                    : `${path} = $_`
        const cast = field.bits > 32
            ? { suffix: 'n', to: 'BigInt', fixup: '' }
            : { suffix: '', to: '', fixup: ' >>> 0' }
        return $(`
            case ${$step++}:

                $_ = 0${cast.suffix}
                $step = ${$step}
                $bite = ${start}${cast.suffix}

            case ${$step++}:

                while ($bite != ${stop}${cast.suffix}) {
                    if ($start == $end) {
                        `, inliner.exit(), `
                        return { start: $start, object: null, parse: $parse }
                    }
                    $_ += ${cast.to}($buffer[$start++]) << $bite * 8${cast.suffix}${cast.fixup}
                    $bite${direction}
                }

                `, assign, `

        `)
    }

    function literal (path, field) {
        function write (literal) {
            if (literal.repeat == 0) {
                return null
            }
            return $(`
                case ${$step++}:

                    $_ = ${(literal.value.length >>> 1) * literal.repeat}
                    $step = ${$step}

                case ${$step++}:

                    $bite = Math.min($end - $start, $_)
                    $_ -= $bite
                    $start += $bite

                    if ($_ != 0) {
                        return { start: $start, object: null, parse: $parse }
                    }
            `)
        }
        return $(`
            `, write(field.before, 1), `

            `, map(dispatch, path, field.fields), `

            `, write(field.after, -1), `
        `)
    }

    function inline (path, field) {
        const inline = inliner.inline_(path, field.after)
        const before = inline.starts != null
            ? $(`
                case ${$step++}:

                    `, inline.starts, `
            `)
            : null
        return $(`
            `, before, -1, `

            `, map(dispatch, inline.path, field.fields), `

                `, -1, inline.inlined, `

                `, -1, inliner.pop(),`
        `)
    }

    function lengthEncoded (path, field) {
        const element = field.fields[0]
        const I = `$I[${++$I}]`
        const encoding = map(dispatch, I, field.encoding)
        if (element.type == 'buffer') {
            locals['index'] = 0
            locals['buffers'] = '[]'
            $I--
            const assign = element.concat
                ? `${path} = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)`
                : `${path} = $buffers`
            return $(`
                `, encoding, `

                    $step = ${$step}

                case ${$step++}:

                    const $length = Math.min(${I} - $index, $end - $start)
                    $buffers.push($buffer.slice($start, $start + $length))
                    $index += $length
                    $start += $length

                    if ($index != ${I}) {
                        `, inliner.exit(), `
                        return { start: $start, parse: $parse }
                    }

                    `, assign, `

                    $index = 0
                    $buffers = []

                    $step = ${$step}
            `)
        }
        const i = `$i[${++$i}]`
        surround = true
        const redo = $step
        const source = $(`
            `, encoding, `
                ${i} = 0
            case ${$step++}:

                `, vivify.assignment(`${path}[${i}]`, field), `

            `, map(dispatch,`${path}[${i}]`, field.fields), `
                if (++${i} != ${I}) {
                    $step = ${redo}
                    continue
                }
        `)
        $I--
        $i--
        return source
    }

    function accumulator (path, field) {
        return $(`
            case ${$step++}:

                `, inliner.accumulator(field), `

            `, map(dispatch, path, field.fields), `
        `)
    }

    // We will have a special case for bite arrays where we can use index of to
    // find the terminator, when the termiantor is zero or `\n\n` or the like,
    // because we can use `indexOf` to find the boundary. Maybe byte arrays
    // should always be returned as `Buffer`s?

    // We will have a another special case for word arrays where the terminated
    // word because we can jump right ito them.

    // Seems like in the past I would read the terminator into an array and if
    // it didn't match, I'd feed the array to the parser, this would handle long
    // weird terminators.

    //
    function terminated (path, field) {
        const length = field.calculated ? `$I[${++$I}]` : field.length
        const inline = field.calculated
            ? inliner.inline(path, [ field.length ], []).inlined.join('\n')
            : null
        // We will be looping.
        surround = true
        // Get the element type contained by the array.
        const element = field.fields[field.fields.length - 1]
        // Our terminator is the padding definition for padded fixed arrays.
        const bytes = field.terminator || field.pad
        // Generate any buffered function calls to process the buffer if we
        // reach the end of the buffer.
        // Skip the remainder for of a fixed padded buffer. Common to buffered
        // and byte-by-byte fixed arrays, not used for terminated. Note that
        // it's a function because of the `$step++`.
        function skip (i) {
            return $(`
                case ${$step++}: {

                    const length = Math.min($_, $end - $start)
                    $start += length
                    $_ -= length

                    if ($_ != 0) {
                        `, inliner.exit(), `
                        return { start: $start, object: null, parse: $parse }
                    }

                    $step = ${$step}

                }
            `)
        }
        //

        // Buffers are a special case. Data is raw, can be copied in bulk,
        // terminators can be found with `indexOf`. Separate implemention for
        // buffers.

        //
        if (field.fields[0].type == 'buffer') {
            locals['buffers'] = '[]'
            if (field.fixed) {
                locals['length'] = 0
            }
            const redo = $step + (field.type == 'fixed' ? 1 : 0)
            // **TODO** This is off for a multi-byte terminator that occurs at
            // the last element. Would begin trying to match the terminator and
            // go past the end of the buffer.
            const slice = field.type == 'fixed' ? $(`
                case ${$step++}:

                    $_ = 0
                    ${length} = `, inline, `

                    $step = ${$step}

                case ${$step++}: {

                    const $index = $buffer.indexOf(${hex(bytes[0])}, $start)
                    if (~$index) {
                        if ($_ + $index > ${length}) {
                            const $length = ${length} - $_
                            $buffers.push($buffer.slice($start, $start + $length))
                            $_ += $length
                            $start += $length
                            $step = ${$step + field.pad.length - 1}
                            continue
                        } else {
                            $buffers.push($buffer.slice($start, $index))
                            $_ += ($index - $start) + 1
                            $start = $index + 1
                            $step = ${$step}
                            continue
                        }
                    } else if ($_ + ($end - $start) >= ${length}) {
                        const $length = ${length} - $_
                        $buffers.push($buffer.slice($start, $start + $length))
                        $_ += $length
                        $start += $length
                        $step = ${$step + field.pad.length - 1}
                        continue
                    } else {
                        $_ += $end - $start
                        $buffers.push($buffer.slice($start))
                        `, inliner.exit(), `
                        return { start: $end, object: null, parse: $parse }
                    }

                    $step = ${$step}

                }

            `) : $(`
                // TODO Here we set the step upon entry, which is why we don't
                // always have to set the step for an integer. Usually we have
                // some sort of preamble that sets the step. We should eliminate
                // steps where we can (why not?) and close the door behind us
                // when we enter a step.
                case ${$step++}: {

                    $step = ${$step - 1}

                    const $index = $buffer.indexOf(${hex(bytes[0])}, $start)
                    if (~$index) {
                        $buffers.push($buffer.slice($start, $index))
                        $start = $index + 1
                        $step = ${$step}
                        continue
                    } else {
                        $buffers.push($buffer.slice($start))
                        `, inliner.exit(), `
                        return { start: $end, object: null, parse: $parse }
                    }

                    $step = ${$step}

                }
            `)
            const subsequent = []
            const done = $step + bytes.length
            for (let i = 1; i < bytes.length; i++) {
                const sofar = bytes.slice(0, i)
                const rewind = sofar.slice(1)
                const rewinds = []
                let found = false
                const seen = []
                do {
                    while (rewind.length != 0) {
                        if (rewind.every((value, index) => bytes[index] == value)) {
                            break
                        }
                        rewind.shift()
                    }
                    if (bytes[rewind.length] != bytes[i] && !seen.includes(bytes[rewind.length])) {
                        seen.push(bytes[rewind.length])
                        rewinds.push($(`
                            if ($buffer[$start - 1] == ${hex(bytes[rewind.length])}) {
                                $buffers.push(Buffer.from(${hex(bytes.slice(0, sofar.length - rewind.length))}))
                                $step = ${redo + 1 + rewind.length}
                                continue
                            }
                        `))
                    }
                    rewind.shift()
                } while (rewind.length != 0)
                subsequent.push($(`
                    case ${$step++}:

                        if ($start == $end) {
                            `, inliner.exit(), `
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start++] != ${hex(bytes[i])}) {
                            `, rewinds.length != 0 ? rewinds.join('\n') : null, `
                            $buffers.push(Buffer.from(${hex(sofar)}.concat($buffer[$start - 1])))
                            $step = ${redo}
                            continue
                        }

                        $step = ${$step}
                `))
            }
            // Assignment buffer with a possible recording of length so far if
            // we have to skip padding.
            function assign () {
                // **TODO** Could use the calculation of `$_` above, but would
                // have to special case `$_` everywhere for fixed/terminated and
                // make the code in here ugly.
                const _length = field.type == 'fixed' ? $(`
                    $_ = ${length} -  Math.min($buffers.reduce((sum, buffer) => {
                        return sum + buffer.length
                    }, ${bytes.length}), ${length})
                `) : null
                return element.concat ? $(`
                    case ${$step++}:

                        `, _length, `

                        ${path} = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers.length = 0

                        $step = ${$step}
                `) : $(`
                    case ${$step++}:

                        `, _length, `

                        ${path} = $buffers
                        $buffers = []

                        $step = ${$step}
                `)
            }
            if (field.type == 'terminated') {
                return $(`
                    `, slice, `

                    `, subsequent.length != 0 ? join(subsequent) : null, -1, `

                    `, assign(), `
                `)
            }
            return $(`
                `, slice, `

                `, subsequent.length != 0 ? join(subsequent) : null, -1, `

                `, assign(), `

                `, skip(), `
            `)
        }
        // Our regular parsing seeks terminators at the start of each iteration
        // of the parse loop.

        // Obtain a next index from the index array.
        const i = `$i[${++$i}]`
        // Initialization step.
        const init = $step++
        // Start of element fields, loop reset.
        const redo = $step
        // We need a step for each byte in the terminator.
        const begin = $step += bytes.length
        // We will sometimes have a vivification step to an object element.
        const vivified = vivify.assignment(`${path}[${i}]`, field)
        if (vivified != null) {
            $step++
        }
        // Create the body of the loop.
        const looped = map(dispatch, `${path}[${i}]`, field.fields)
        // Release the length index from the array of lengths if calculated.
        if (field.calculated) {
            $I--
        }
        // Step of next field is after a final loop jump step.
        const done = $step + 1
        //

        // Generate the terminator detection.

        //
        const fixed = field.type == 'fixed'
            ? $(`
                if (${i} == ${length}) {
                    $step = ${done}
                    continue
                }
            `)
            : null
        const terminator = bytes.length == 1
            // If we have a single byte terminator, we skip over the loop if the
            // we see the byte. A multi-byte terminator is more complicated.
            ? $(`
                case ${redo}:

                    $step = ${redo}

                    `, fixed, -1, `

                    if ($start == $end) {
                        `, inliner.exit(), `
                        return { start: $start, object: null, parse: $parse }
                    }

                    if ($buffer[$start] == ${hex(bytes[0])}) {
                        $start++
                        $step = ${done}
                        continue
                    }

                    $step = ${begin}
            `)
            // For a multi-byte terminator we have a step for each byte.
            //
            // For every terminator byte last check to see if it
            // matches the byte in the buffer. If it does we fall through to
            // test next byte. If not we set the `$step` to the start of the
            // body.
            //
            // Subsequent to the first byte we will have matched and skipped
            // bytes but we'll know what they where, so we can still parse them
            // by calling the defined `$parse` function with a literal buffer.
            //
            // If the last byte does not match we jump to the end. The last byte
            // might seem like a good place to fall through instead of jumping,
            // but we will have already begun parsing by parsing the terminator
            // literal and it will have proceded past the initialization of the
            // next field. We won't know how many initialization steps there, it
            // varies based on field and even if we did attempt to ensure that
            // every field type had a single initialization step it would still
            // vary due to nesting.
            : join(bytes.map((bite, index) => {
                const parse = index != 0
                    ? `$parse(Buffer.from(${hex(bytes.slice(0, index))}), 0, ${index})`
                    : null
                const next = index != literal.length - 1
                    ? `$step = ${redo + index + 1}`
                    : $(`
                        $step = ${done}
                        continue
                    `)
                return $(`
                    case ${redo + index}:

                        $step = ${redo + index}

                        `, index == 0 ? fixed : null, -1, `

                        if ($start == $end) {
                            `, inliner.exit(), `
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start] != ${hex(bite)}) {
                            $step = ${begin}
                            `, parse, `
                            continue
                        }
                        $start++

                        `, next, `
                `)
            }))
        const initialize = vivified == null ? $(`
            case ${init}:

                ${i} = 0
                ${length} = `, inline, `

            `, terminator, `
        `) : $(`
            case ${init}:

                ${i} = 0
                ${length} = `, inline, `

            `, terminator, `

            case ${begin}:

                `, vivify.assignment(`${path}[${i}]`, field), `
        `)
        // Put it all together.
        const source = $(`
            `, initialize, `

            `, looped, `

            case ${$step++}:

                ${i}++
                $step = ${redo}
                continue
        `)
        // Release the array index from the array of indices.
        $i--
        // If we are actually padded fixed array, we need to skip over the
        // remaining bytes in the fixed width field.
        locals['length'] = 0
        // TODO And has padding?
        if (field.type == 'fixed') {
            return $(`
                `, source, `

                case ${$step++}:

                    $_ = ${length} != ${i}
                        ? (${length} - ${i}) * ${element.bits >>> 3} - ${bytes.length}
                        : 0

                    $step = ${$step}

                `, skip(`(${i} + ${bytes.length})`), `
            `)
        }
        return $(`
            `, source, `

            case ${$step}:

                // Here
                $step = ${$step++}
        `)
    }

    // TODO: Folling is notes on things to come.

    // We will have a special case for bite arrays where we can use index of to
    // find the terminator, when the termiantor is zero or `\n\n` or the like,
    // because we can use `indexOf` to find the boundary. Maybe byte arrays
    // should always be returned as `Buffer`s?

    // We will have a another special case for word arrays where the terminated
    // word because we can jump right ito them.

    // Seems like in the past I would read the terminator into an array and if
    // it didn't match, I'd feed the array to the parser, this would handle long
    // weird terminators.

    //
    function fixed (path, field) {
        if (field.pad.length != 0) {
            return terminated(path, field)
        }
        const calculation = field.calculated ? inliner.test(path, field.length) : null
        const element = field.fields[field.fields.length - 1]
        const length = field.calculated  ? `$I[${++$I}]` : field.length
        //

        // Use `Buffer` functions when fixed array is a `Buffer`.
        //
        // **TODO** I'm going to make this a todo, not an issue, but it would be
        // nice to use `TypedArray` when we have an array of words and the
        // desired byte order matches the machine byte order.

        //
        if (element.type == 'buffer') {
            locals['buffers'] = '[]'
            const assign = element.concat
                ? `${path} = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)`
                : `${path} = $buffers`
            return $(`
                case ${$step++}:

                    $_ = 0
                    ${length} = `, calculation, `

                    $step = ${$step}

                case ${$step++}: {

                    const length = Math.min($end - $start, ${length} - $_)
                    $buffers.push($buffer.slice($start, $start + length))
                    $start += length
                    $_ += length

                    if ($_ != ${length}) {
                        `, inliner.exit(), `
                        return { start: $start, object: null, parse: $parse }
                    }

                    `, assign, `
                    $buffers = []

                    $step = ${$step}

                }
            `)
        }
        //

        // For everything but `Buffer`, generate byte-by-byte parsers.

        //
        surround = true
        // Obtain a next index from the index array.
        const i = `$i[${++$i}]`
        // The loop return step is after loop index initialization.
        const redo = $step + 1
        // We sometimes have a vivification step to create an object element.
        // **TODO** Eliminate vivify step if not used.
        const remaining = field.calculated && field.fixed
            ? `$_ = (${length} - ${i}) * ${element.bits >>> 3} - ${field.pad.length}`
            : null

        const vivified = vivify.assignment(`${path}[${i}]`, field)
        const initialization = vivified == null ? $(`
            case ${$step++}:

                ${i} = 0
                ${length} = `, calculation, `
        `) : $(`
            case ${$step++}:

                ${i} = 0
                ${length} = `, calculation, `

            case ${$step++}:

                `, vivified, `
        `)
        const source = $(`
            `, initialization, `

            `, map(dispatch,`${path}[${i}]`, field.fields), `

            case ${$step++}:

                ${i}++

                if (${i} != ${length}) {
                    $step = ${redo}
                    continue
                }

                `, remaining, `
                $step = ${$step}
        `)
        // Release the length index from the array of lengths if calculated.
        if (field.calculated) {
            $I--
        }
        // Generate skip logic if we are fixed width.
        const skip = field.pad.length != 0 ? $(`
            case ${$step++}:

                $bite = Math.min($end - $start, $_)
                $_ -= $bite
                $start += $bite

                if ($_ != 0) {
                    return { start: $start, object: null, parse: $parse }
                }

                $step = ${$step}
        `) : null
        // Release the array index from the array of indices.
        $i--
        return $(`
            `, source, `

            `, skip, `
        `)
    }

    function conditional (path, field) {
        const { parse } = field
        surround = true
        const signature = []
        const sip = function () {
            if (parse.sip == null) {
                return null
            }
            signature.push('$sip')
            return map(dispatch, '$sip', parse.sip)
        } ()
        const rewind = function () {
            if (parse.sip == null) {
                return null
            }
            const bytes = []
            if (parse.sip[0].endianness == 'big') {
                for (let i = 0, I = parse.sip[0].bits / 8; i < I; i++) {
                    bytes.push(`($sip >>> ${i * 8}) & 0xff`)
                }
            } else {
                for (let i = parse.sip[0].bits / 8 - 1, I = -1; i > I; i--) {
                    bytes.push(`($sip >>> ${i * 8}) & 0xff`)
                }
            }
            return $(`
                $parse([
                    `, bytes.join('\n'), `
                ], 0, ${bytes.length})
            `)
        } ()
        const tests = field.parse.conditions
                                 .filter(condition => condition.test != null)
                                 .map(condition => condition.test)
        const invocations = inliner.accumulations(tests)
        signature.push(packet.name)
        const start = $step++
        const steps = []
        for (const condition of parse.conditions) {
            steps.push({
                number: $step,
                source: map(dispatch, path, condition.fields)
            })
        }
        let ladder = '', keywords = 'if'
        for (let i = 0, I = parse.conditions.length; i < I; i++) {
            const condition = parse.conditions[i]
            const vivified = vivify.assignment(path, condition)
            ladder = condition.test != null ? function () {
                const test = inliner.test(path, condition.test, signature)
                return $(`
                    `, ladder, `${keywords} (`, test, `) {
                        `, vivified, -1, `

                        $step = ${steps[i].number}
                        `, rewind, `
                        continue
                    }
                `)
            } () : $(`
                `, ladder, ` else {
                    `, vivified, -1, `

                    $step = ${steps[i].number}
                    `, rewind, `
                    continue
                }
            `)
            keywords = ' else if'
        }
        const done = $(`
            $step = ${$step}
            continue
        `)
        return $(`
            `, sip, `

            case ${start}:

                `, invocations, -1, `

                `, ladder, `

            `, join(steps.map((step, i) => {
                return $(`
                    `, step.source, `

                        `, steps.length - 1 != i ? done : null, `
                `)
            })), `
        `)
    }

    function switched (path, field) {
        surround = true
        const start = $step++
        const cases = []
        const steps = []
        for (const when of field.cases) {
            const vivified = vivify.assignment(path, when)
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                    `, vivified, -1, `

                    $step = ${$step}
                    continue
            `))
            steps.push(map(dispatch, path, when.fields))
        }
        const invocations = inliner.accumulations([ field.select ])
        const test = inliner.test(path, field.select, [])
        const select = field.stringify ? `String(${test})` : test
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

    function dispatch (path, packet, depth) {
        switch (packet.type) {
        case 'structure':
            return map(dispatch, path, packet.fields)
        case 'conditional':
            return conditional(path, packet)
        case 'switch':
            return switched(path, packet)
        case 'fixed':
            return fixed(path, packet)
        case 'terminated':
            return terminated(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'accumulator':
            return accumulator(path, packet)
        case 'inline':
            return inline(path, packet)
        case 'literal':
            return literal(path, packet)
        case 'integer':
            return integer(path, packet)
        case 'absent':
            return absent(path, packet)
        }
    }

    function generate () {
        let source = $(`
            switch ($step) {
            case ${$step++}:

                `, vivify.structure(packet.name, packet), `

                $step = ${$step}

            `, dispatch(packet.name, packet, 0), `

            case ${$step}:

                return { start: $start, object: ${packet.name}, parse: null }
            }
        `)

        const signatories = {
            packet: `${packet.name}`,
            parameters: null,
            step: '$step = 0',
            i: '$i = []',
            I: '$I = []',
            sip: '$sip = 0',
            accumulator: '$accumulator = []',
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

        if (surround) {
            source = $(`
                for (;;) {
                    `, source, `
                    break
                }
            `)
        }

        const object = `parsers.inc.${packet.name}`

        const requires = required(require)

        variables.register = true
        variables.bite = true

        const declarations = {
            register: '$_',
            bite: '$bite',
            starts: '$restart = false',
            buffers: '$buffers = []',
            begin: '$begin = 0'
        }

        const lets = Object.keys(declarations)
                           .filter(key => variables[key])
                           .map(key => declarations[key])
                           .concat(Object.keys(locals).map(name => `$${name} = ${locals[name]}`))

        const restart = variables.starts ? $(`
            if ($restart) {
                for (let $j = 0; $j < $starts.length; $j++) {
                    $starts[$j] = $start
                }
            }
            $restart = true
        `) : null

        return $(`
            parsers.inc.${packet.name} = function () {
                `, requires, -1, `

                return function (`, signature.join(', '), `) {
                    let ${lets.join(', ')}

                    return function $parse ($buffer, $start, $end) {
                        `, restart, -1, `

                        `, source, `
                    }
                }
            } ()
        `)
    }

    return generate()
}

module.exports = function (definition, options) {
    return join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet, options)))
}
