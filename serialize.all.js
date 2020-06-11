const join = require('./join')
const map = require('./map')
const lookup = require('./lookup')
const snuggle = require('./snuggle')
const pack = require('./pack')
const $ = require('programmatic')

function checkpoints (path, fields, index = 0, rewind = 0) {
    let checkpoint
    const checked = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind } ]
    for (const field of fields) {
        switch (field.type) {
        case 'literal':
            if (field.fixed) {
                checkpoint.lengths[0] += field.bits / 8
            }
            break
        case 'terminated':
            if (field.fields.filter(field => ! field.fixed).length == 0) {
                checkpoint.lengths[0] += field.terminator.length
                const bits = field.fields.reduce((sum, field) => sum + field.bits, 0)
                checkpoint.lengths.push(`${bits / 8} * ${path + field.dotted}.length`)
            } else {
            }
            break
        case 'conditional':
            for (const condition of field.serialize.conditions) {
                condition.fields = checkpoints(path, condition.fields, index, rewind)
            }
            break
        case 'lengthEncoded':
            // TODO Test a following single byte.
            checkpoint.lengths[0] += field.encoding[0].bits / 8
            if (field.fixed) {
                checkpoint.lengths.push(`${field.element.bits / 8} * ${path + field.dotted}.length`)
            }  else {
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
            }
            break
        case 'structure':
            if (field.fixed) {
                checkpoint.lengths.push(`${field.bits / 8} * ${path + field.dotted}.length`)
            }  else {
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
            }
            break
        default:
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        checked.push(field)
    }
    checked.forEach(field => {
        if (field.type == 'checkpoint' && field.lengths[0] == 0) {
            field.lengths.shift()
        }
    })
    return checked.filter(field => {
        return field.type != 'checkpoint' || field.lengths.length != 0
    })
}

function generate (packet, bff) {
    let $step = 0, $i = -1

    const variables = { packet: true, step: true }
    const constants = { assert: false }

    const $lookup = {}

    function word (asignee, field) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'big' ? bytes - 1 : 0
        const stop = field.endianness == 'big' ? -1 : bytes
        const direction = field.endianness == 'big' ? -1 : 1
        const shifts = []
        while (bite != stop) {
            const shift = bite ? asignee + ' >>> ' + bite * 8 : asignee
            shifts.push(`$buffer[$start++] = ${shift} & 0xff`)
            bite += direction
        }
        return shifts.join('\n')
    }

    function integer (path, field) {
        $step += 2
        if (field.fields) {
            variables.register = true
            const packing = pack(packet, field, path, '$_')
            return $(`
                `, packing, `

                `, word('$_', field), `
            `)
        } else if (field.lookup) {
            variables.register = true
            lookup($lookup, path, field.lookup.slice())
            return $(`
                $_ = $lookup.${path}.indexOf(${path})

                `, word('$_', field), `
            `)
            console.log($lookup)
            throw new Error
        } else {
            return word(path, field)
        }
    }

    // TODO You need to test incrementing step correctly when contained variable
    // is variable length and not fixed. Not yet implemented.
    function literal (path, field) {
        function write (literal) {
            switch (literal.repeat) {
            case 0:
                return null
            case 1:
                return $(`
                    $buffer.write(${JSON.stringify(literal.value)}, $start, $start + ${literal.value.length / 2}, 'hex')
                    $start += ${literal.value.length / 2}
                `)
            default:
                variables.i = true
                return $(`
                    for ($i[${$i + 1}] = 0; $i[${$i + 1}] < ${literal.repeat}; $i[${$i + 1}]++) {
                        $buffer.write(${JSON.stringify(literal.value)}, $start, $start + ${literal.value.length / 2}, 'hex')
                        $start += ${literal.value.length / 2}
                    }
                `)
            }
        }
        return $(`
            `, write(field.before), -1, `

            `, map(dispatch, path, field.fields), -1, `

            `, write(field.after), -1, `
        `)
    }

    function lengthEncoded (path, field) {
        variables.i = true
        // $step += 2 TODO I think this is outgoing. Delete if tests pass.
        const i = `$i[${++$i}]`
        const source = $(`
            `, map(dispatch, path + '.length', field.encoding), `

            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, map(dispatch, path + `[${i}]`, field.fields), `
            }
        `)
        $i--
        return source
    }

    function terminated (path, field) {
        variables.i = true
        $step += 2
        const i = `$i[${++$i}]`
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        const terminator = []
        for (const bite of field.terminator) {
            terminator.push(`$buffer[$start++] = 0x${bite.toString(16)}`)
        }
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, looped, `
            }

            `, terminator.join('\n'), `
        `)
        $i--
        return source
    }

    function fixed (path, field) {
        variables.i = true
        $step += 2
        const i = `$i[${++$i}]`
        const looped = map(dispatch, `${path}[${i}]`, field.fields)
        const pad = field.pad.length == 0 ? null : $(`
            for (;;) {
                `, join(field.pad.map((bite, index) => {
                    return $(`
                        if (${i} == ${field.length}) {
                            break
                        }
                        $buffer[$start++] = 0x${bite.toString(16)}
                        ${i}++
                    `)
                })), `
            }
        `)
        const assertion = (constants.assert = field.pad.length == 0)
                        ? `assert.equal(${path}.length, ${field.length})`
                        : null
        const source = $(`
            `, assertion, -1, `

            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, looped, `
            }

            `, pad, -1, `
        `)
        $i--
        return source
    }

    function conditional (path, conditional) {
        const block = []
        $step++
        for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
            const condition = conditional.serialize.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            const signature = []
            if (conditional.serialize.split) {
                signature.push(path)
            }
            signature.push(packet.name)
            const ifed = $(`
                ${keyword} ((${condition.source})(${signature.join(', ')})) {
                    `, source, `
                }
            `)
            block.push(ifed)
        }
        return snuggle(block)
    }

    function checkpoint (checkpoint) {
        const i = packet.lengthEncoded ? '$i' : '[]'
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(${packet.name}, ${$step - checkpoint.rewind}, ${i})
                }
            }
        `)
    }

    function dispatch (path, field) {
        switch (field.type) {
        case 'structure':
            return join(field.fields.map(field => dispatch(path + field.dotted, field)))
        case 'checkpoint':
            return checkpoint(field)
        case 'conditional':
            return conditional(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'terminated':
            return terminated(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'buffer':
            return buffer(field)
        case 'integer':
            return integer(path, field)
        case 'literal':
            return literal(path, field)
        default:
            throw new Error
        }
    }

    const source = dispatch(packet.name, packet)
    const declarations = {
        register: '$_',
        i: '$i = []',
        sip: '$sip = []',
        assert: `assert = require('assert')`
    }
    const consts = Object.keys(declarations)
                         .filter(key => constants[key])
                         .map(key => declarations[key])
    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])
    const lookups = Object.keys($lookup).length != 0
                  ? `const $lookup = ${JSON.stringify($lookup, null, 4)}`
                  : null
    return $(`
        serializers.${bff ? 'bff' : 'all'}.${packet.name} = function (${packet.name}) {
            `, lookups, -1, `

            return function ($buffer, $start, $end) {
                `, consts.length != 0 ? `const ${consts.join(', ')}` : null, -1, `

                `, lets.length != 0 ? `let ${lets.join(', ')}` : null, -1, `

                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = checkpoints(packet.name, packet.fields)
        }
        return generate(packet, options.bff)
    }))
    return compiler(source)
}
