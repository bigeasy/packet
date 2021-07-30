const packetize = require('./packetize')

require('arguable')(module, async arguable => {
    const definitions = {}
    for (const file of arguable.argv) {
        const required = require(file)
        for (const name in required) {
            definitions[name] = required[name]
        }
    }
    arguable.stdout.write(packetize(definitions))
    return 0
})
