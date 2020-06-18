const join = require('./join')
const map = require('./map')
const lookup = require('./lookup')
const snuggle = require('./snuggle')
const pack = require('./pack')
const $ = require('programmatic')

function expand (fields) {
    const expanded = []
    for (const field of fields) {
        switch (field.type) {
        case 'lengthEncoded':
            field.fields = expand(field.fields)
            expanded.push({ type: 'lengthEncoding', body: field, dotted: field.dotted })
            expanded.push(field)
            break
        case 'terminated':
            field.fields = expand(field.fields)
            expanded.push(field)
            expanded.push({ type: 'terminator', body: field })
            break
        case 'fixed':
        case 'structure':
            field.fields = expand(field.fields)
            expanded.push(field)
            break
        case 'conditional':
            for (const condition of field.serialize.conditions) {
                condition.fields = expand(condition.fields)
            }
            expanded.push(field)
            break
        case 'switch':
            for (const when of field.cases) {
                when.fields = expand(when.fields)
            }
            expanded.push(field)
            break
        default:
            expanded.push(field)
            break
        }
    }
    return expanded
}

function checkpoints (path, fields, index = 0, rewind = 0) {
    let checkpoint
    const checked = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind } ]
    for (const field of fields) {
        switch (field.type) {
        case 'literal':
            checked.push(field)
            if (field.fixed) {
                checkpoint.lengths[0] += field.bits / 8
            }
            break
        case 'terminated':
            checked.push(field)
            if (field.fields[0].fixed) {
                checkpoint.lengths.push(`${field.fields[0].bits / 8} * ${path + field.dotted}.length`)
            } else {
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'terminator':
            checked.push(field)
            checkpoint.lengths[0] += field.body.terminator.length
            break
        case 'switch':
            checked.push(field)
            for (const when of field.cases) {
                when.fields = checkpoints(path, when.fields, index, rewind)
            }
            checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            break
        case 'conditional':
            checked.push(field)
            for (const condition of field.serialize.conditions) {
                condition.fields = checkpoints(path, condition.fields, index, rewind)
            }
            checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            break
        case 'lengthEncoding':
            checked.push(field)
            checkpoint.lengths[0] += field.body.encoding[0].bits / 8
            break
        case 'lengthEncoded':
            checked.push(field)
            // TODO Test a following single byte.
            if (field.fields[0].fixed) {
                checkpoint.lengths.push(`${field.fields[0].bits / 8} * ${path + field.dotted}.length`)
            }  else {
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'structure':
            checked.push(field)
            if (field.fixed) {
                checkpoint.lengths.push(`${field.bits / 8}`)
            }  else {
                field.fields = checkpoints(path + `${field.dotted}`, field.fields, index + 1)
            }
            break
        default:
            checked.push(field)
            checkpoint.lengths[0] += field.bits / 8
            break
        }
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
        const cast = field.bits > 32
            ? { to: 'n', from: 'Number', shift: '>>' }
            : { to: '', from: '', shift: '>>>' }
        while (bite != stop) {
            const shift = bite ? `${asignee} ${cast.shift} ${bite * 8}${cast.to}` : asignee
            shifts.push(`$buffer[$start++] = ${cast.from}(${shift} & 0xff${cast.to})`)
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
                $step += 2
                return $(`
                    $buffer.write(${JSON.stringify(literal.value)}, $start, $start + ${literal.value.length / 2}, 'hex')
                    $start += ${literal.value.length / 2}
                `)
            default:
                $step += 4
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

    function lengthEncoding (path, field) {
        variables.i = true
        return map(dispatch, path + '.length', field.body.encoding)
    }

    function lengthEncoded (path, field) {
        // $step += 2 TODO I think this is outgoing. Delete if tests pass.
        const i = `$i[${++$i}]`
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, map(dispatch, path + `[${i}]`, field.fields), `
            }
        `)
        $i--
        return source
    }

    function terminated (path, field) {
        variables.i = true
        $step += 1
        const i = `$i[${++$i}]`
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, looped, `
            }
        `)
        $i--
        return source
    }

    function terminator (field) {
        const terminator = []
        $step += field.body.terminator.length
        for (const bite of field.body.terminator) {
            terminator.push(`$buffer[$start++] = 0x${bite.toString(16)}`)
        }
        return terminator.join('\n')
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

    function fixup (path, field) {
        // TODO Maybe instead of reusing I, use a `$stack` variable.
        // TODO Or maybe a single stack `$$` or similar.
        const before = field.before != null ? function () {
            $step++
            variables.i = true
            const i = `$i[${++$i}]`
            return {
                path: i,
                source: `${i} = (${field.before.source})(${path})`
            }
        } () : { path: path, source: null }
        const source =  $(`
            `, before.source, -1, `

            `, map(dispatch, before.path, field.fields), `
        `)
        if (field.before) {
            $i--
        }
        return source
    }

    function conditional (path, conditional) {
        const block = []
        $step++
        for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
            const condition = conditional.serialize.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            if (condition.test != null) {
                const signature = []
                if (conditional.serialize.split) {
                    signature.push(path)
                }
                signature.push(packet.name)
                block.push($(`
                    ${i == 0 ? 'if' : 'else if'} ((${condition.test.source})(${signature.join(', ')})) {
                        `, source, `
                    }
                `))
            } else {
                block.push($(`
                    else {
                        `, source, `
                    }
                `))
            }
        }
        return snuggle(block)
    }

    function switched (path, field) {
        $step++
        const cases = []
        for (const when of field.cases) {
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                    `, join(when.fields.map(field => dispatch(path + field.dotted, field))), `

                    break
            `))
        }
        if (field.stringify) {
            return $(`
                switch (String((${field.source})(${packet.name}))) {
                `, join(cases), `
                }
            `)
        }
        return $(`
            switch ((${field.source})(${packet.name})) {
            `, join(cases), `
            }
        `)
    }

    function checkpoint (checkpoint) {
        if (checkpoint.lengths.length == 0) {
            return null
        }
        const signatories = {
            packet: packet.name,
            step: $step,
            i: '$i',
            I: '$I'
        }
        const signature = Object.keys(signatories)
                                .filter(key => variables[key])
                                .map(key => signatories[key])
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return serializers.inc.object(${signature.join(', ')})($buffer, $start, $end)
            }
        `)
    }

    function dispatch (path, field) {
        switch (field.type) {
        case 'structure':
            return join(field.fields.map(field => dispatch(path + field.dotted, field)))
        case 'checkpoint':
            return checkpoint(field)
        case 'switch':
            return switched(path, field)
        case 'conditional':
            return conditional(path, field)
        case 'fixup':
            return fixup(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'terminated':
            return terminated(path, field)
        case 'terminator':
            return terminator(field)
        case 'lengthEncoding':
            return lengthEncoding(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'buffer':
            return buffer(field)
        case 'bigint':
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
    const expanded = expand(JSON.parse(JSON.stringify(definition)))
    const source = join(expanded.map(function (packet) {
        if (options.bff) {
            packet.fields = checkpoints(packet.name, packet.fields)
        }
        return generate(packet, options.bff)
    }))
    return compiler(source)
}
