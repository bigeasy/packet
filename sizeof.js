const $ = require('programmatic')

const join = require('./join')

function generate (packet) {
    function field (packet, field) {
        switch (field.type) {
        case 'integer':
            return `$_ += ${field.bits / 8}`
        case 'lengthEncoding':
            return $(`
                $_ += ${field.bits / 8}
            `)
        case 'lengthEncoded':
            return $(`
                $_ += ${field.element.bits / 8} * ${packet.name}.${field.name}.length
            `)
        }
    }

    const source = join(packet.fields.map(field.bind(null, packet)))

    return  $(`
        sizeOf.${packet.name} = function (${packet.name}) {
            let $_ = 0

            `, source, `

            return $_
        }
    `)
}

module.exports = function (compiler, packets) {
    const sources = packets.map(packet => generate(packet))
    return compiler(join(sources))
}
