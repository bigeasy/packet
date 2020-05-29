const $ = require('programmatic')

const snuggle = require('./snuggle')
const join = require('./join')

function generate (packet) {
    const variables = {
        register: true
    }

    let $i = -1

    // TODO Fold constants, you're doing `$_ += 1; $_ += 2` which won't fold.
    function dispatch (path, field) {
        switch (field.type) {
        case 'conditional': {
                const block = []
                for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
                    const condition = field.serialize.conditions[i]
                    const source = join(condition.fields.map(dispatch.bind(null, path)))
                    const keyword = typeof condition.source == 'boolean' ? 'else'
                                                                       : i == 0 ? 'if' : 'else if'
                    const ifed = $(`
                        ${keyword} ((${condition.source})(${path}, ${packet.name})) {
                            `, source, `
                        }
                    `)
                    block.push(ifed)
                }
                return snuggle(block)
            }
        case 'literal':
        case 'integer':
            return `$_ += ${field.bits / 8}`
        case 'lengthEncoding':
            return $(`
                $_ += ${field.bits / 8}
            `)
        case 'lengthEncoded':
            if (field.fixed) {
                return $(`
                    $_ += ${field.element.bits / 8} * ${path}.length
                `)
            } else {
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, join(field.fields.map(field => dispatch(path + `[${i}]`, field))), `
                    }
                `)
                $i--
                return source
            }
        case 'terminated': {
                if (field.fields.filter(field => !field.fixed).length == 0) {
                    const bits = field.fields.reduce((sum, field) => sum + field.bits, 0)
                    return $(`
                        $_ += ${bits / 8} * ${path}.length + ${field.terminator.length}
                    `)
                }
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, join(field.fields.map(field => dispatch(path + `[${i}]`, field))), `
                    }
                    $_ += ${field.terminator.length}
                `)
                $i--
                return source
            }
            break
        case 'structure': {
                if (field.fixed) {
                    return `$_ += ${field.bits / 8}`
                }
                return join(field.fields.map(field => dispatch(path + field.dotted, field)))
            }
            break
        }
    }

    const source = dispatch(packet.name, packet)
    const declarations = {
        register: '$_ = 0',
        i: '$i = []'
    }
    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])

    return  $(`
        sizeOf.${packet.name} = function (${packet.name}) {
            let ${lets.join(', ')}

            `, source, `

            return $_
        }
    `)
}

module.exports = function (compiler, packets) {
    const sources = packets.map(packet => generate(packet))
    return compiler(join(sources))
}
