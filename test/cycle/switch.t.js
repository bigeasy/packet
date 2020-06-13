require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'switched/strings',
        define: {
            object: {
                type: 8,
                value: [ $ => $.type, {
                    0: 8,
                    1: 16
                }, 24 ]
            }
        },
        objects: [{
            type: 0,
            value: 0xab
        }, {
            type: 1,
            value: 0xabcd
        }, {
            type: 2,
            value: 0xabcdef
        }]
    })
}
