require('proof')(1, (okay) => {
    const path = require('path')
    const compiler = require('../../require')
    const sizeOf = require('../../sizeof')
    const filename = path.resolve(__dirname, '../generated/minimal.sizeof.js')
    const constructors = { object: {} }
    const compiled = sizeOf(compiler('sizeOf', filename), [{
        name: 'object',
        fields: [{
            type: 'integer',
            name: 'field',
            bits: 8
        }]
    }])(constructors)
    const caliper = constructors.object({ field: 255 })
    okay(caliper, 1, 'sizeof byte')
})
