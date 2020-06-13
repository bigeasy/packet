const join = require('./join')
const map = require('./map')
const snuggle = require('./snuggle')
const unpack = require('./unpack')
const unsign = require('./fiddle/unsign')
const $ = require('programmatic')
const vivify = require('./vivify')
const lookup = require('./lookup')

function generate (packet) {
    let $step = 0, $i = -1, $sip = -1, iterate = false, _terminated = false, surround = false

    const lets = { packet: true, step: true }
    const $lookup = {}

    function integer (path, field) {
        const bytes = field.bits / 8
        if (bytes == 1 && field.fields == null && field.lookup == null) {
            return $(`
                case ${$step++}:

                    $step = ${$step}

                case ${$step++}:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    ${path} = $buffer[$start++]

            `)
        }
        const start = field.endianness == 'big' ? bytes - 1 : 0
        const stop = field.endianness == 'big' ? -1 : bytes
        const direction = field.endianness == 'big' ?  '--' : '++'
        const assign = field.fields
            ? unpack(packet, path, field, '$_')
            : field.compliment
                ? `${path} = ${unsign('$_', field.bits)}`
                : field.lookup
                    ? `${path} = $lookup.${path}[$_]`
                    : `${path} = $_`
        if (field.lookup) {
            lookup($lookup, path, field.lookup.slice())
        }
        return $(`
            case ${$step++}:

                $_ = 0
                $step = ${$step}
                $bite = ${start}

            case ${$step++}:

                while ($bite != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += $buffer[$start++] << $bite * 8 >>> 0
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

                    $_ = ${literal.value.length / 2 * literal.repeat}
                    $step = ${$step}

                case ${$step++}:

                    $bite = Math.min($end - $start, $_)
                    $_ -= $bite
                    $start += $bite

                    if ($_ != 0) {
                        return { start: $start, object: null, parse }
                    }
            `)
        }
        return $(`
            `, write(field.before, 1), `

            `, map(dispatch, path, field.fields), `

            `, write(field.after, -1), `
        `)
    }

    function lengthEncoded (path, packet) {
        lets.i = true
        lets.I = true
        $i++
        const i = `$i[${$i}]`
        const I = `$I[${$i}]`
        const encoding = map(dispatch, I, packet.encoding)
        // var integer = integer(packet.length, 'length')
        // Invoked here to set `again`.
        const again = $step
        const source = $(`
            `, encoding, `
                ${i} = 0
            case ${$step++}:

                `, vivify.array(`${path}[${i}]`, packet), `

            `, map(dispatch,`${path}[${i}]`, packet.fields), `
                if (++${i} != ${I}) {
                    $step = ${again}
                    continue
                }
        `)
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
    function terminated (path, field) {
        lets.i = true
        $i++
        const i = `$i[${$i}]`
        _terminated = true
        const init = $step
        let sip = ++$step
        const redo = $step
        const begin = $step += field.terminator.length
        $step++
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const literal = field.terminator.map(bite => `0x${bite.toString(16)}`)
        const terminator = join(field.terminator.map((bite, index) => {
            if (index != field.terminator.length - 1) {
                return $(`
                    case ${sip++}:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            continue
                        }
                        $start++

                        $step = ${sip}
                `)
            } else {
                return $(`
                    case ${sip++}:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            parse([ ${literal.slice(0, index).join(', ')} ], 0, ${index})
                            continue
                        }
                        $start++

                        $step = ${$step + 1}
                        continue
                `)
            }
        }))
        const source = $(`
            case ${init}:

                ${i} = 0

            `, terminator, `

            case ${begin}:

                `, vivify.array(`${path}[${i}]`, field), `

            `, looped, `

            case ${$step++}:

                ${i}++
                $step = ${redo}
                continue
        `)
        $i--
        return source
    }

    function conditional (path, conditional) {
        const { parse } = conditional
        iterate = true
        const signature = []
        const sip = function () {
            if (conditional.parse.sip == null) {
                return null
            }
            lets.sip = true
            $sip++
            signature.push(`$sip[${$sip}]`)
            return join(parse.sip.map(field => dispatch(`$sip[${$sip}]`, field)))
        } ()
        signature.push(packet.name)
        const start = $step++
        const steps = []
        for (const condition of parse.conditions) {
            steps.push({
                number: $step,
                source: join(condition.fields.map(field => dispatch(path, field)))
            })
        }
        const ladder = []
        for (let i = 0, I = parse.conditions.length; i < I; i++) {
            const condition = parse.conditions[i]
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            ladder.push($(`
                ${keyword} ((${condition.source})(${signature.join(', ')})) {
                    $step = ${steps[i].number}
                    continue
                }
            `))
        }
        const done = $(`
            $step = ${$step}
            continue
        `)
        if (conditional.parse.sip != null) {
            $sip--
        }
        return $(`
            `, sip, `

            case ${start}:

                `, snuggle(ladder), `

            `, join(steps.map((step, i) => {
                return $(`
                    `, step.source, `

                        `, steps.length - 1 != i ? done : null, `
                `)
            })), `
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
    function fixed (path, field) {
        lets.i = true
        $i++
        const i = `$i[${$i}]`
        _terminated = true
        const init = $step
        let sip = ++$step
        const redo = $step
        const begin = $step += field.pad.length
        $step++
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const literal = field.pad.map(bite => `0x${bite.toString(16)}`)
        // TODO Seems like there ought to be some rules. I'm only going to
        // support multi-character string terminators, really. If you have an
        // terminated array of variable structures that could also be fixed,
        // that's a horrible format.
        const fit = Math.ceil(field.pad.length / (field.bits / 8))
        const remaining
            = field.fixed ? $(`
                if (${field.length} - ${i} < ${field.pad.length}) {
                    $step = ${$step + 1}
                    continue
                }
            `) : null
        const terminator = field.pad.length ? join(field.pad.map((bite, index) => {
            if (index != field.pad.length - 1) {
                return $(`
                    case ${sip++}:

                        `, remaining, 1, `

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            continue
                        }
                        $start++

                        $step = ${sip}
                `)
            } else {
                return $(`
                    case ${sip++}:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x${bite.toString(16)}) {
                            $step = ${begin}
                            parse([ ${literal.slice(0, index).join(', ')} ], 0, ${index})
                            continue
                        }
                        $start++

                        $step = ${$step + 1}
                        continue
                `)
            }
        })) : null
        const source = $(`
            case ${init}:

                ${i} = 0

            `, terminator, -1, `

            case ${begin}:

                `, vivify.array(`${path}[${i}]`, field), `

            `, looped, `

            case ${$step++}:

                ${i}++

                if (${i} == ${field.length}) {
                    $step = ${$step}
                    continue
                }

                $step = ${redo}
                continue

            case ${$step++}:

                $_ = (${field.length} - ${i}) * ${field.bits / field.length / 8} - ${field.pad.length}
                $step = ${$step}

            case ${$step++}:

                $bite = Math.min($end - $start, $_)
                $_ -= $bite
                $start += $bite

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }

                $step = ${$step}
        `)
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
                case ${JSON.stringify(when.value)}:

                    $step = ${$step}
                    continue
            `))
            steps.push(join(when.fields.map(field => dispatch(path, field))))
        }
        if (field.otherwise != null) {
            cases.push($(`
                default:

                    $step = ${$step}
                    continue
            `))
            steps.push(join(field.otherwise.map(field => dispatch(path, field))))
        }
        // TODO Slicing here is because of who writes the next step, which seems
        // to be somewhat confused.
        return $(`
            case ${start}:

                switch (String((${field.source})(${packet.name}))) {
                `, join(cases), `
                }

            `, join([].concat(steps.slice(steps, steps.length - 1).map(step => $(`
                `, step, `
                    $step = ${$step}
                    continue
            `)), steps.slice(steps.length -1))), `
        `)
    }

    function dispatch (path, packet, depth, arrayed) {
        switch (packet.type) {
        case 'structure':
            return map(dispatch, path, packet.fields)
        case 'switch':
            return switched(path, packet)
        case 'conditional':
            return conditional(path, packet)
        case 'fixed':
            return fixed(path, packet)
        case 'terminated':
            return terminated(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'integer':
            return integer(path, packet)
        case 'function':
            return $(`
                case ${$step++}:

                    ${path} = (${packet.source})($sip[0])
            `)
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
        packet: `${packet.name} = {}`,
        step: '$step = 0',
        i: '$i = []',
        I: '$I = []',
        sip: '$sip = []'
    }
    const signature = Object.keys(signatories)
                            .filter(key => lets[key])
                            .map(key => signatories[key])
    if (iterate || lets.i || lets.sip || surround) {
        source = $(`
            for (;;) {
                `, source, `
                break
            }
        `)
    }

    const object = `parsers.inc.${packet.name}`
    const lookups = Object.keys($lookup).length != 0
                  ? `const $lookup = ${JSON.stringify($lookup, null, 4)}`
                  : null
    return $(`
        ${object} = function (${signature.join(', ')}) {
            `, lookups, -1, `

            let $_, $bite
            return function parse ($buffer, $start, $end) {
                `, source, `
            }
        }
    `)
}

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet))))
}
