const map = require('./map')

// Generate integer packing.
const pack = require('./pack')

// Maintain a set of lookup constants.
const lookup = require('./lookup')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

// Format source code maintaining indentation.
const join = require('./join')

// Join an array of strings with first line of subsequent element catenated to
// last line of previous element.
const snuggle = require('./snuggle')

//

// Add implicit field definitions to the given array of field definitions.

//
function expand (fields) {
    const expanded = []
    for (const field of fields) {
        switch (field.type) {
        case 'lengthEncoded':
            field.fields = expand(field.fields)
            expanded.push({
                type: 'lengthEncoding', body: field, dotted: field.dotted, vivify: null
            })
            expanded.push(field)
            break
        case 'terminated':
            field.fields = expand(field.fields)
            expanded.push(field)
            expanded.push({ type: 'terminator', body: field, vivify: null })
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

function checkpoints (path, fields, index = 0) {
    let checkpoint
    const checked = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ], vivify: null } ]
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
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null
                })
            }
            break
        case 'terminator':
            checked.push(field)
            checkpoint.lengths[0] += field.body.terminator.length
            break
        case 'switch':
            checked.push(field)
            for (const when of field.cases) {
                when.fields = checkpoints(path, when.fields, index)
            }
            checked.push(checkpoint = {
                type: 'checkpoint', lengths: [ 0 ], vivify: null
            })
            break
        case 'conditional':
            checked.push(field)
            for (const condition of field.serialize.conditions) {
                condition.fields = checkpoints(path, condition.fields, index)
            }
            checked.push(checkpoint = {
                type: 'checkpoint', lengths: [ 0 ], vivify: null
            })
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
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null
                })
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

function generate (packet, { require = null, bff }) {
    let $step = 0, $i = -1, $$ = -1

    const variables = { packet: true, step: true }
    const accumulate = {
        accumulator: {},
        variables: variables,
        packet: packet.name,
        direction: 'serialize'
    }

    const $lookup = {}

    function word (assignee, field) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'big' ? bytes - 1 : 0
        const stop = field.endianness == 'big' ? -1 : bytes
        const direction = field.endianness == 'big' ? -1 : 1
        const shifts = []
        const cast = field.bits > 32
            ? { to: 'n', from: 'Number', shift: '>>' }
            : { to: '', from: '', shift: '>>>' }
        while (bite != stop) {
            const shift = bite ? `${assignee} ${cast.shift} ${bite * 8}${cast.to}` : assignee
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
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, looped, `
            }

            `, pad, -1, `
        `)
        $i--
        return source
    }

    function inline (path, field) {
        const before = field.before.length != 0 ? function () {
            $step++
            variables.stack = true
            const register = `$$[${++$$}]`
            const inline = inliner(accumulate, path, field.before, [
                path, register
            ], register)
            if (inline.inlined.length == 0) {
                return { path: path, source: null }
            }
            return {
                path: inline.register,
                source: join(inline.inlined)
            }
        } () : { path: path, source: null }
        if (before.path[0] != '$') {
            $$--
        }
        const source =  $(`
            `, before.source, -1, `

            `, map(dispatch, before.path, field.fields), `
        `)
        if (before.path[0] == '$') {
            $$--
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
                const registers = conditional.serialize.split ? [ path ] : []
                const f = inliner(accumulate, path, [ condition.test ], registers)
                block.push($(`
                    ${i == 0 ? 'if' : 'else if'} (${f.inlined.shift()}) {
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

    function accumulator (path, field) {
        variables.accumulator = true
        return $(`
            `, accumulatorer(accumulate, field), `

            `, map(dispatch, path + field.dotted, field.fields), `
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
            stack: '$$'
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
        case 'accumulator':
            return accumulator(path, field)
        case 'switch':
            return switched(path, field)
        case 'conditional':
            return conditional(path, field)
        case 'inline':
            return inline(path, field)
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
        stack: '$$ = []',
        sip: '$sip = []',
        accumulator: '$accumulator = {}'
    }
    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])
    const lookups = Object.keys($lookup).length != 0
                  ? `const $lookup = ${JSON.stringify($lookup, null, 4)}`
                  : null

    const requires = required(require)

    return $(`
        serializers.${bff ? 'bff' : 'all'}.${packet.name} = function () {
            `, requires, -1, `

            `, lookups, -1, `

            return function (${packet.name}) {
                return function ($buffer, $start, $end) {
                    `, lets.length != 0 ? `let ${lets.join(', ')}` : null, -1, `

                    `, source, `

                    return { start: $start, serialize: null }
                }
            }
        } ()
    `)
}

module.exports = function (definition, options = {}) {
    const expanded = expand(JSON.parse(JSON.stringify(definition)))
    return join(expanded.map(function (packet) {
        if (options.bff) {
            packet.fields = checkpoints(packet.name, packet.fields)
        }
        return generate(packet, options)
    }))
}
