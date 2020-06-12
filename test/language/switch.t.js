require('proof')(1, okay => {
    const simplified = require('../../simplified')
    // TODO Come back and complete when you've implemented nested structures.
    console.log(require('util').inspect(simplified({
        packet: {
            type: 8,
            value: [ $ => $.type, {
                0: 8,
                1: 16
            }, 32 ]
        }
    }), { depth: null }))
})
