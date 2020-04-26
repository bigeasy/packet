const $ = require('programmatic')

const snuggle = require('./snuggle')
const join = require('./join')

function generate (packet) {
    const lets = { '$_ = 0': true }

    let $i = -1

    function structure (path, field) {
        return join(field.fields.map(dispatch.bind(null, path)))
    }

    // TODO Fold constants, you're doing `$_ += 1; $_ += 2` which won't fold.
    function dispatch (path, field) {
        switch (field.type) {
        case 'conditional': {
                const block = []
                for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
                    const condition = field.serialize.conditions[i]
                    const source = join(condition.fields.map(dispatch.bind(null, path + field.dotted)))
                    const keyword = typeof condition.source == 'boolean' ? 'else'
                                                                       : i == 0 ? 'if' : 'else if'
                    const ifed = $(`
                        ${keyword} ((${condition.source})(${path + field.dotted}, ${packet.name})) {
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
            if (field.element.fixed) {
                return $(`
                    $_ += ${field.element.bits / 8} * ${path + field.dotted}.length
                `)
            } else {
                lets['$i = []'] = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    for (${i} = 0; ${i} < ${path + field.dotted}.length; ${i}++) {
                        `, structure(path + `${field.dotted}[${i}]`, field.element), `
                    }
                `)
                $i--
                return source
            }
        }
    }

    const source = structure(packet.name, packet)

    return  $(`
        sizeOf.${packet.name} = function (${packet.name}) {
            let ${Object.keys(lets).join(', ')}

            `, source, `

            return $_
        }
    `)
}

module.exports = function (compiler, packets) {
    const sources = packets.map(packet => generate(packet))
    return compiler(join(sources))
}
