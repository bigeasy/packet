const packetize = require('./packetize')

require('arguable')(module, async arguable => {
    const definition = { packet: {} }
    for (const file of arguable.argv) {
        const required = require(file)
        for (const name in required.packet) {
            definition.packet[name] = required.packet[name]
        }
    }
    arguable.stdout.write(packetize(definition))
    return 0
})
