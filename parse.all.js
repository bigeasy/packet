// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate literal object construction.
const vivify = require('./vivify')

// Generate two's compliment conversion.
const unsign = require('./fiddle/unsign')

// Generate integer unpacking.
const unpack = require('./unpack')

// Maintain a set of lookup constants.
const lookup = require('./lookup')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

const map = require('./map')

// Format source code maintaining indentation.
const join = require('./join')

// Join an array of strings with first line of subsequent element catenated to
// last line of previous element.
const snuggle = require('./snuggle')

function expand (fields) {
    const expanded = []
    for (const field of fields) {
        switch (field.type) {
        case 'lengthEncoded':
            field.fields = expand(field.fields)
            expanded.push({ type: 'lengthEncoding', body: field, vivify: null })
            expanded.push(field)
            break
        case 'terminated':
            field.fields = [{
                type: 'terminator', body: field, dotted: '', vivify: null
            }, {
                type: 'repeated',
                body: field,
                fields: expand(field.fields),
                dotted: '',
                vivify: 'array'
            }]
            expanded.push(field)
            break
        case 'fixed':
        case 'structure':
            field.fields = expand(field.fields)
            expanded.push(field)
            break
        case 'conditional':
            for (const condition of field.parse.conditions) {
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

function generate (packet, { require, bff }) {
    let $i = -1, $I = -1, $sip = -1, $step = 1

    const variables = { packet: true, step: true }
    const accumulate = { accumulator: {}, variables, packet, direction: 'parse' }

    const $lookup = {}

    // TODO You can certianly do something to make this prettier.
    // TODO Start by prepending the path I think?
    function checkpoints (path, fields, index = 0) {
        let checkpoint = { type: 'checkpoint', lengths: [ 0 ] }, checked = [ checkpoint ]
        for (const field of fields) {
            switch (field.type) {
            case 'function':
                checked.push(field)
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
                // TODO Sip belongs outside since it is generally a byte or so.
                if (field.parse.sip != null) {
                    variables.sip = true
                    field.parse.sip = checkpoints(path, field.parse.sip, index)
                }
                for (const condition of field.parse.conditions) {
                    condition.fields = checkpoints(path, condition.fields, index)
                }
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null
                })
                break
            case 'lengthEncoding':
                checked.push(field)
                checkpoint.lengths[0] += field.body.encoding[0].bits / 8
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null
                })
                break
            case 'lengthEncoded':
                checked.push(field)
                if (field.fields[0].fixed) {
                    // Tricky, stick the checkpoint for a fixed array at the end
                    // of the encoding fields. Let any subsequent fields use the
                    // checkpoint.
                    checkpoint.lengths.push(`${field.fields[0].bits / 8} * $I[${index}]`)
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
            case 'repeated':
                // TODO If the terminator is greater than or equal to the size
                // of the repeated part, we do not have to perform the
                // checkpoint.
                checked.push(field)
                field.fields = checkpoints(path, field.fields, index + 1)
                break
            case 'terminated':
                checked.push(field)
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null
                })
                break
            case 'structure':
                checked.push(field)
                if (field.fixed) {
                    checkpoint.lengths[0] += field.bits / 8
                } else {
                    // TODO Could start from the nested checkpoint since we are
                    // are not actually looping for the structure.
                    field.fields = checkpoints(path + field.dotted, field.fields, index)
                    checked.push(checkpoint = {
                        type: 'checkpoint', lengths: [ 0 ], vivify: null
                    })
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

    function integer (assignee, field) {
        const variable = field.lookup || field.fields || field.compliment ? '$_' : assignee
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const reads = []
        const cast = field.bits > 32
            ? { suffix: 'n', to: 'BigInt' }
            : { suffix: '', to: '' }
        while (bite != stop) {
            reads.unshift(`${cast.to}($buffer[$start++])`)
            if (bite) {
                reads[0] += ` * 0x${(256n ** BigInt(bite)).toString(16)}${cast.suffix}`
            }
            bite += direction
        }
        $step += 2
        const parse = bytes == 1 ? `${variable} = ${reads.join('')}`
                                 : $(`
                                        ${variable} =
                                            `, reads.reverse().join(' +\n'), `
                                    `)
        if (field.fields) {
            variables.register = true
            return $(`
                `, parse, `

                `, unpack(packet, assignee, field, '$_'), `
            `)
        } else if (field.lookup) {
            variables.register = true
            lookup($lookup, assignee, field.lookup.slice())
            return $(`
                `, parse, `

                ${assignee} = $lookup.${assignee}[$_]
            `)
        }

        if (field.compliment) {
            variables.register = true
            return $(`
                `, parse, `
                ${assignee} = ${unsign(variable, field.bits)}
            `)
        }

        return parse
    }

    function literal (path, field) {
        function write (literal) {
            if (literal.repeat == 0) {
                return null
            }
            return $(`
                $start += ${literal.value.length / 2 * literal.repeat}
            `)
        }
        return $(`
            `, write(field.before), 1, `

            `, map(dispatch, path, field.fields), `

            `, write(field.after), -1, `
        `)
    }

    function lengthEncoding (path, field) {
        variables.i = true
        variables.I = true
        $i++
        $I++
        return $(`
            `, map(dispatch, `$I[${$I}]`, field.body.encoding), `
            $i[${$i}] = 0
        `)
    }

    function lengthEncoded (path, field) {
        const i = `$i[${$i}]`
        // Step to skip incremental parser's vivification of the array element.
        $step++
        const source = $(`
            for (; ${i} < $I[${$I}]; ${i}++) {
                `, vivify.array(`${path}[${i}]`, field), -1, `

                `, map(dispatch, `${path}[${i}]`, field.fields), `
            }
        `)
        $i--
        $I--
        return source
    }

    function terminator (field) {
        $step += field.body.terminator.length + 1
        // TODO We really do not want to go beyond the end of the buffer in a
        // whole parser and loop forever, so we still need the checkpoints. The
        // same goes for length encoded. We don't want a malformed packet to
        // cause an enormous loop. Checkpoints for loops only?
        //
        // TODO The above is for documentation. You can have the essence of a
        // serializer, but you should always use a best-foot-forward parser to
        // guard against evil coming in from the outside.
        //
        // TODO When the type is integer and the same size as the terminator
        // lets create an integer sentry.
        //
        // TODO No, it's simple really. We don't need checked whole serializers,
        // but all parsers should be checked somehow. You don't have to worry
        // about running forever, because you can limit the file size, buffer
        // size. Perhaps we have upper limits on arrays, sure. Add that to the
        // langauge somehow, but we shouldn't have unchecked parsers. We use the
        // `bff` logic and return an error if it doesn't fit.
        const terminator = field.body.terminator.map((bite, index) => {
            if (index == 0) {
                return `$buffer[$start] == 0x${bite.toString(16)}`
            } else {
                return `$buffer[$start + ${index}] == 0x${bite.toString(16)}`
            }
        })

        return $(`
            if (
                `, terminator.join(' &&\n'), `
            ) {
                $start += ${terminator.length}
                break
            }
        `)
    }

    function repeated (path, field) {
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        return $(`
            `, vivify.array(path + `[${i}]`, field), -1, `

            `, looped, `

            ${i}++
        `)
    }

    function terminated (path, field) {
        $step++
        variables.i = true
        $i++
        const looped = join(field.fields.map(field => dispatch(path + field.dotted, field)))
        $step++
        const source = $(`
            $i[${$i}] = 0
            for (;;) {
                `, looped, `
            }
        `)
        $i--
        return source
    }

    function fixed (path, field) {
        variables.i = true
        const i = `$i[${++$i}]`
        $step += 1
        const check = bff && field.pad.length != 0
                    ? checkpoint({ lengths: [ field.pad.length ] })
                    : null
        $step += 1
        $step += field.pad.length
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        $step += field.pad.length
        const terminator = field.pad.map((bite, index) => {
            if (index == 0) {
                return `$buffer[$start] == 0x${bite.toString(16)}`
            } else {
                return `$buffer[$start + ${index}] == 0x${bite.toString(16)}`
            }
        })
        const terminate = terminator.length != 0
                        ? $(`
                            if (
                                `, terminator.join(' &&\n'), `
                            ) {
                                $start += ${terminator.length}
                                break
                            }
                        `)
                        : null
        const source = $(`
            ${i} = 0
            for (;;) {
                `, check, -1, `

                `, terminate, -1, `

                `, vivify.array(path + `[${i}]`, field), -1, `

                `, looped, `
                ${i}++

                if (${i} == ${field.length}) {
                    break
                }
            }

        `)
        $i--
        if (terminator.length) {
            return $(`
                `, source, `

                $start += (${field.length} - ${i}) * ${field.bits / field.length / 8} - ${field.pad.length}
            `)
        }
        return source
    }

    function inline (path, field) {
        const after = field.after.length != 0 ? function () {
            const inline = inliner(accumulate, path, field.after, path, [ path ])
            if (inline.inlined.length == 0) {
                return null
            }
            return join(inline.inlined)
        } () : null
        const source =  $(`
            `, map(dispatch, path, field.fields), `

            `, -1, after, `
        `)
        return source
    }

    function conditional (path, conditional) {
        const block = []
        const signature = []
        const sip = function () {
            if (conditional.parse.sip == null) {
                return null
            }
            variables.sip = true
            $sip++
            signature.push(`$sip[${$sip}]`)
            return join(conditional.parse.sip.map(field => dispatch(`$sip[${$sip}]`, field)))
        } ()
        signature.push(packet.name)
        $step++
        for (let i = 0, I = conditional.parse.conditions.length; i < I; i++) {
            const condition = conditional.parse.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            if (condition.test != null) {
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
        if (conditional.parse.sip != null) {
            $sip--
        }
        return $(`
            `, sip, -1, `

            `, snuggle(block), `
        `)
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

    function checkpoint (checkpoint, depth) {
        if (checkpoint.lengths.length == 0) {
            return null
        }
        const signatories = {
            packet: packet.name,
            step: $step,
            i: '$i',
            I: '$I',
            sip: '$sip'
        }
        const signature = Object.keys(signatories)
                                .filter(key => variables[key])
                                .map(key => signatories[key])
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return parsers.inc.${packet.name}(${signature.join(', ')})($buffer, $start, $end)
            }
        `)
    }

    function dispatch (path, field, root = false) {
        switch (field.type) {
        case 'structure': {
                return map(dispatch, path, field.fields)
            }
        case 'checkpoint':
            return checkpoint(field)
        case 'accumulator':
            return accumulator(path, field)
        case 'switch':
            return switched(path, field)
        case 'inline':
            return inline(path, field)
        case 'conditional':
            return conditional(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'repeated':
            return repeated(path, field)
        case 'terminator':
            return terminator(field)
        case 'terminated':
            return terminated(path, field)
        case 'lengthEncoding':
            return lengthEncoding(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'function':
            $step++
            return `${path} = (${field.source})($sip[${$sip}])`
        case 'literal':
            return literal(path, field)
        default:
            return integer(path, field)
        }
    }

    if (bff) {
        packet.fields = checkpoints(packet.name, packet.fields)
    }

    const source = dispatch(packet.name, packet, true)
    const declarations = {
        register: '$_',
        i: '$i = []',
        I: '$I = []',
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

    if (bff) {
        return $(`
            parsers.bff.${packet.name} = function () {
                `, requires, -1, `

                `, lookups, -1, `

                return function () {
                    return function parse ($buffer, $start, $end) {
                        `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                        `, vivify.structure(`let ${packet.name}`, packet), `

                        `, source, `

                        return { start: $start, object: object, parse: null }
                    }
                } ()
            }
        `)
    }

    return $(`
        parsers.all.${packet.name} = function () {
            `, requires, -1, `

            `, lookups, -1, `

            return function ($buffer, $start) {
                `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                `, 'let ' + vivify.structure(packet.name, packet), `

                `, source, `

                return ${packet.name}
            }
        } ()
    `)
}

module.exports = function (definition, options = {}) {
    const expanded = expand(JSON.parse(JSON.stringify(definition)))
    return join(expanded.map(packet => generate(packet, options)))
}
