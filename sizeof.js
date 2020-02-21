const $ = require('programmatic')

const join = require('./join')

function generate (packet) {
    const lets = { '$_ = 0': true }

    function structure (path, field) {
        return join(field.fields.map(dispatch.bind(null, path)))
    }

    function dispatch (path, field) {
        switch (field.type) {
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
