const $ = require('programmatic')

const snuggle = require('./snuggle')
const join = require('./join')

function generate (packet) {
    const lets = { '$_ = 0': true }

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
                    const source = join(condition.fields.map(dispatch.bind(null, path.concat(field.name))))
                    const keyword = typeof condition.text == 'boolean' ? 'else'
                                                                       : i == 0 ? 'if' : 'else if'
                    const ifed = $(`
                        ${keyword} ((${condition.test})(${path.concat(field.name).join('.')}, ${packet.name})) {
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
                    $_ += ${field.element.bits / 8} * ${path.join('.')}.${field.name}.length
                `)
            } else {
                lets['$i = []'] = true
                const i = `$i[${path.length - 1}]`
                return $(`
                    for (${i} = 0; ${i} < ${path.join('.')}.${field.name}.length; ${i}++) {
                        `, structure(path.concat(`${field.name}[${i}]`), field.element), `
                    }
                `)
            }
        }
    }

    const source = structure([ packet.name ], packet)

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
