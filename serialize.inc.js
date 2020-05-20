const $ = require('programmatic')
const join = require('./join')
const map = require('./map')
const snuggle = require('./snuggle')
const pack = require('./pack')

function generate (packet) {
    let $step = 0, $i = -1, surround = false

    const variables = { packet: true, step: true }

    function integer (path, field) {
        const endianness = field.endianness || 'big'
        const bytes = field.bits / 8
        const direction = field.endianness == 'big' ? '--' : '++'
        let bite = field.endianness == 'big' ? bytes - 1 : 0
        let stop = field.endianness == 'big' ? -1 : bytes
        const assign = field.fields ? pack(field, path, '$_') : `$_ = ${path}`
        const source = $(`
            case ${$step++}:

                $step = ${$step}
                $bite = ${bite}
                `, assign, `

            case ${$step++}:

                while ($bite != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
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
            return $(`
                case ${$step++}:

                    $step = ${$step}
                    $bite = 0
                    $_ = ${JSON.stringify(bytes)}

                case ${$step++}:

                    while ($bite != ${literal.value.length / 2}) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_[$bite++]
                    }

            `)
        }
        return $(`
            `, write(field.before), 1, `

            `, map(dispatch, path, field.fields), `

            `, write(field.after), -1, `
        `)
        // TODO Remove that line?
    }

    // TODO I don't need to push and pop $i.
    function lengthEncoded (path, packet) {
        variables.i = true
        const i = `$i[${$i}]`
        const again = $step
        const source = $(`
            `, map(dispatch, `${path}[${i}]`, packet.fields), `

                if (++${i} != ${path}.length) {
                    $step = ${again}
                    continue
                }
        `)
        $i--
        return source
    }

    function lengthEncoding (path, packet) {
        $i++
        return $(`
            `, integer(path + '.length', packet), `
                $i[${$i}] = 0
        `)

    }

    function terminated (path, field) {
        variables.i = true
        $i++
        const init = $step
        const again = ++$step
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const done = $step
        const terminator = join(field.terminator.map(bite => {
            return $(`
                case ${$step++}:

                    if ($start == $end) {
                        return { start: $start, serialize }
                    }

                    $buffer[$start++] = 0x${bite.toString(16)}

                    $step = ${$step}
            `)
        }))
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

            `, terminator, `
        `)
        $i--
        return source
    }

    function fixed (path, field) {
        variables.i = true
        $i++
        const init = $step
        const again = ++$step
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const done = $step
        const pad = join(field.pad.map(bite => {
            return $(`
                case ${$step++}:

                    if ($start == $end) {
                        return { start: $start, serialize }
                    }

                    if (${i}++ == ${field.length}) {
                        $step = ${done + field.pad.length}
                        continue
                    }

                    $buffer[$start++] = 0x${bite.toString(16)}

                    $step = ${$step}
            `)
        }))
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

            `, pad, `

                if (${i} != ${field.length}) {
                    $step = ${done}
                    continue
                }
        `)
        $i--
        return source
    }

    function conditional (path, conditional) {
        surround = true
        const start = $step++
        const steps = []
        for (const condition of conditional.serialize.conditions) {
            steps.push({
                step: $step,
                source: join(condition.fields.map(field => dispatch(path, field)))
            })
        }
        const ladder = []
        for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
            const condition = conditional.serialize.conditions[i]
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            ladder.push($(`
                ${keyword} ((${condition.source})(${path}, ${packet.name})) {
                    $step = ${steps[i].step}
                    continue
                }
            `))
        }
        const done = $(`
            $step = ${$step}
            continue
        `)
        // TODO Instead of choping the literal source, prevent adding the
        // trailing line, maybe. Or maybe this is best.
        return $(`
            case ${start}:

                `, snuggle(ladder), `

            `, join(steps.map((step, i) => {
                return $(`
                    `, step.source, `
                        `, -1, steps.length - 1 != i ? done : null, `
                `)
            })), `
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
        case 'conditional':
            return conditional(path, packet)
        case 'fixed':
            return fixed(path, packet)
        case 'terminated':
            return terminated(path, packet)
        case 'lengthEncoding':
            return lengthEncoding(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'literal':
            return literal(path, packet)
        case 'integer':
            // TODO This will not include the final step, we keep it off for the
            // looping constructs.
            return integer(path, packet)
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

    if (variables.i || surround) {
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
        i: '$i = []'
    }
    const signature = Object.keys(signatories)
                            .filter(key => variables[key])
                            .map(key => signatories[key])

    const object = 'serializers.inc.' + packet.name
    const generated = $(`
        ${object} = function (${signature.join(', ')}) {
            let $bite, $stop, $_

            return function serialize ($buffer, $start, $end) {
                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
    return generated
}

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet))))
}
