const packetize = require('./packetize')

require('arguable')(module, async arguable => {
    const definitions = {}
    const file = arguable.argv[0]
    const required = require(file)
    for (const name in required.packet) {
        definitions[name] = required.packet[name]
    }
    arguable.stdout.write(packetize(definitions))
    return 0
})
