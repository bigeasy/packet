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

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate invocations of accumulators before conditionals.
const accumulations = require('./accumulations')

// Generate inline function source.
const inliner = require('./inliner')

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

    // An map of parser scoped variable definitions to their initialization
    // values.
    const locals = {}

    // Determine which variables will be passed into in this parser from a
    // best-foot-forward parse.
    const variables = declare(packet)

    // An object that tracks the declaration of accumulators.
    const accumulate = {
        accumulator: {},
        accumulated: [],
        buffered: [],
        variables: variables,
        packet: packet.name,
        direction: 'parse'
    }

    function absent (path, field) {
        return $(`
            case ${$step++}:

                ${path} = ${util.inspect(field.value)}

                $step = ${$step}
        `)
    }

    function integer (path, field) {
        const bytes = field.bits / 8
        const buffered = accumulate.buffered.map(buffered => buffered.source)
        if (bytes == 1 && field.fields == null && field.lookup == null) {
            return $(`
                case ${$step++}:

                    $step = ${$step}

                case ${$step++}:

                    if ($start == $end) {
                        `, buffered.length != 0 ? buffered.join('\n') : null, `
                        return { start: $start, object: null, parse: $parse }
                    }

                    ${path} = $buffer[$start++]

            `)
        }
        //
        const start = field.endianness == 'big' ? bytes - 1 : 0
        const stop = field.endianness == 'big' ? -1 : bytes
        const direction = field.endianness == 'big' ?  '--' : '++'
        const assign = field.fields
            ? unpack(accumulate, packet, path, field, '$_')
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
                        `, buffered.length != 0 ? buffered.join('\n') : null, `
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

    function lengthEncoded (path, field) {
        const element = field.fields[0]
        const I = `$I[${++$I}]`
        const encoding = map(dispatch, I, field.encoding)
        if (element.type == 'buffer') {
            const buffered = accumulate.buffered.length != 0 ? accumulate.buffered.map(buffered => {
                return $(`
                    `, buffered.source, `
                    $starts[${buffered.start}] = $start
                `)
            }).join('\n') : null
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
                        `, buffered, `
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
        // We will be looping.
        surround = true
        // Get the element type contained by the array.
        const element = field.fields[field.fields.length - 1]
        // Our terminator is the padding definition for padded fixed arrays.
        const bytes = field.terminator || field.pad
        // Generate any buffered function calls to process the buffer if we
        // reach the end of the buffer.
        const buffered = accumulate.buffered.length != 0
                       ? accumulate.buffered.map(buffered => buffered.source).join('\n')
                       : null
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
                        `, buffered, `
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

                    $step = ${$step}

                case ${$step++}: {

                    const $index = $buffer.indexOf(${hex(bytes[0])}, $start)
                    if (~$index) {
                        if ($_ + $index > ${field.length}) {
                            const $length = ${field.length} - $_
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
                    } else if ($_ + ($end - $start) >= ${field.length}) {
                        const $length = ${field.length} - $_
                        $buffers.push($buffer.slice($start, $start + $length))
                        $_ += $length
                        $start += $length
                        $step = ${$step + field.pad.length - 1}
                        continue
                    } else {
                        $_ += $end - $start
                        $buffers.push($buffer.slice($start))
                        `, buffered, `
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
                        `, buffered, `
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
                            `, buffered, `
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
                const length = field.type == 'fixed' ? $(`
                    $_ = ${field.length} -  Math.min($buffers.reduce((sum, buffer) => {
                        return sum + buffer.length
                    }, ${bytes.length}), ${field.length})
                `) : null
                return element.concat ? $(`
                    case ${$step++}:

                        `, length, `

                        ${path} = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers.length = 0

                        $step = ${$step}
                `) : $(`
                    case ${$step++}:

                        `, length, `

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
        const init = $step
        // Start of element fields, loop reset.
        const redo = ++$step
        // We need a step for each byte in the terminator.
        const begin = $step += bytes.length
        // We will sometimes have a vivification step to an object element.
        $step++
        // Create the body of the loop.
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        // Step of next field is after a final loop jump step.
        const done = $step + 1
        //

        // Generate the terminator detection.

        //
        const fixed = field.type == 'fixed'
            ? field.calculated
                ? $(`
                    if (${i} == $I[${++$I}]) {
                        $step = ${done}
                        continue
                    }
                `)
                : $(`
                    if (${i} == ${field.length}) {
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
                        `, buffered, `
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
                            `, buffered, `
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
        // Put it all together.
        let source = null
        let I = null
        if (field.type == 'fixed' && field.calculated) {
            I = `$I[${$I}]`
            const inline = inliner(accumulate, path, [ field.length ], [])
            source = $(`
                case ${init}:

                    ${i} = 0
                    ${I} = `, inline.inlined.shift(), `

                `, terminator, `

                case ${begin}:

                    `, vivify.assignment(`${path}[${i}]`, field), `

                `, looped, `

                case ${$step++}:

                    ${i}++
                    $step = ${redo}
                    continue
            `)
            $I--
        } else {
            source = $(`
                case ${init}:

                    ${i} = 0

                `, terminator, `

                case ${begin}:

                    `, vivify.assignment(`${path}[${i}]`, field), `

                `, looped, `

                case ${$step++}:

                    ${i}++
                    $step = ${redo}
                    continue
            `)
        }
        // Release the array index from the array of indices.
        $i--
        // If we are actually padded fixed array, we need to skip over the
        // remaining bytes in the fixed width field.
        locals['length'] = 0
        // TODO And has padding?
        if (field.type == 'fixed') {
            const length = field.calculated ? I : field.length
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

    function conditional (path, field) {
        const { parse } = field
        surround = true
        const signature = []
        const sip = function () {
            if (parse.sip == null) {
                return null
            }
            signature.push(`$sip`)
            return join(parse.sip.map(field => dispatch(`$sip`, field)))
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
        const invocations = accumulations({
            functions: field.parse.conditions.map(condition => condition.test),
            accumulate: accumulate
        })
        signature.push(packet.name)
        const start = $step++
        const steps = []
        for (const condition of parse.conditions) {
            steps.push({
                number: $step,
                source: join(condition.fields.map(field => dispatch(path, field)))
            })
        }
        let ladder = '', keywords = 'if'
        for (let i = 0, I = parse.conditions.length; i < I; i++) {
            const condition = parse.conditions[i]
            const vivified = vivify.assignment(path, condition)
            ladder = condition.test != null ? function () {
                const inline = inliner(accumulate, path, [ condition.test ], signature)
                return $(`
                    `, ladder, `${keywords} (`, inline.inlined.shift(), `) {
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
        const element = field.fields[field.fields.length - 1]
        const buffered = accumulate.buffered.map(buffered => buffered.source)
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

                    $step = ${$step}

                case ${$step++}: {

                    const length = Math.min($end - $start, ${field.length} - $_)
                    $buffers.push($buffer.slice($start, $start + length))
                    $start += length
                    $_ += length

                    if ($_ != ${field.length}) {
                        `, buffered.length != 0 ? buffered.join('\n') : null, `
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
        const width = field.bits / field.length / 8
        let source = null
        if (field.calculated) {
            const inline = inliner(accumulate, path, [ field.length ], [])
            const element = field.fields[field.fields.length - 1]
            const I = `$I[${++$I}]`
            if (field.fixed) {
                source = $(`
                    case ${$step++}:

                        ${i} = 0
                        ${I} = `, inline.inlined.shift(), `

                    case ${$step++}:

                        `, vivify.assignment(`${path}[${i}]`, field), -1, `

                    `, map(dispatch,`${path}[${i}]`, field.fields), `

                    case ${$step++}:

                        ${i}++

                        if (${i} != ${path}.length) { // foo
                            $step = ${redo}
                            continue
                        }

                        $_ = (${I} - ${i}) * ${element.bits >>> 3} - ${field.pad.length}
                        $step = ${$step}
                `)
            } else {
            }
            $I--
        } else {
            source = $(`
                case ${$step++}:

                    ${i} = 0

                case ${$step++}:

                    `, vivify.assignment(`${path}[${i}]`, field), -1, `

                `, map(dispatch,`${path}[${i}]`, field.fields), `

                case ${$step++}:

                    ${i}++

                    if (${i} != ${field.length}) {
                        $step = ${redo}
                        continue
                    }

                    $_ = (${field.length} - ${i}) * ${width} - ${field.pad.length}
                    $step = ${$step}
            `)
        }
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

    function inline (path, field) {
        const after = field.after.length != 0 ? function () {
            const inline = inliner(accumulate, path, field.after, [ path ], path)
            if (
                inline.inlined.length == 0 &&
                inline.buffered.start == inline.buffered.end
            ) {
                return {
                    before: null,
                    after: null,
                    buffered: {
                        start: accumulate.buffered.length,
                        end: accumulate.buffered.length
                    }
                }
            }
            const starts = []
            for (let i = inline.buffered.start, I = inline.buffered.end; i < I; i++) {
                starts.push(`$starts[${i}] = $start`)
            }
            return {
                before: starts.length != 0 ? $(`
                    case ${$step++}:

                        `, starts.join('\n'), `

                `) : null,
                after: join(inline.inlined),
                buffered: inline.buffered
            }
        } () : {
            before: null,
            after: null,
            buffered: {
                start: accumulate.buffered.length,
                end: accumulate.buffered.length
            }
        }
        const source = map(dispatch, path, field.fields)
        const buffered = accumulate.buffered
            .splice(0, after.buffered.end)
            .map(buffered => {
                return buffered.source
            })
        return $(`
            `, after.before, `
            `, source, `
                `, -1, after.after, `
                `, buffered.length != 0 ? buffered.join('\n') : null, `
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
            steps.push(join(when.fields.map(field => dispatch(path, field))))
        }
        const inlined = inliner(accumulate, path, [ field.select ], [])
        const select = field.stringify
            ? `String(${inlined.inlined.shift()})`
            : inlined.inlined.shift()
        // TODO Slicing here is because of who writes the next step, which seems
        // to be somewhat confused.
        const invocations = accumulations({
            functions: [ field.test ],
            accumulate: accumulate
        })
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

    function dispatch (path, packet, depth) {
        switch (packet.type) {
        case 'structure':
            return map(dispatch, path, packet.fields)
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
        case 'buffer':
        case 'bigint':
        case 'integer':
            return integer(path, packet)
        case 'absent':
            return absent(path, packet)
        case 'literal':
            return literal(path, packet)
        }
    }

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
        step: '$step = 0',
        i: '$i = []',
        I: '$I = []',
        sip: '$sip = 0',
        accumulator: '$accumulator = []',
        starts: '$starts = []'
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

            return function (${signature.join(', ')}) {
                let ${lets.join(', ')}

                return function $parse ($buffer, $start, $end) {
                    `, restart, -1, `

                    `, source, `
                }
            }
        } ()
    `)
}

module.exports = function (definition, options) {
    return join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet, options)))
}
