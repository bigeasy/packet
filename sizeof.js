const $ = require('programmatic')

const join = require('./join')

function generate (packet) {
    function field (packet, field) {
        switch (field.type) {
        case 'integer':
            return `$_ += ${field.bits / 8}`
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
