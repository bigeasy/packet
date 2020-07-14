require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'terminated/words',
        define: {
            object: { array: [ [ 16 ], 0x0, 0x0 ], sentry: 8  }
        },
        objects: [{ array: [ 0x0012, 0x4567, 0x890a, 0xcdef ], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'terminated/nested',
        define: {
            object: {
                array: [ [ [ [ 16 ], 0x0, 0x0 ] ], 0x0, 0x0 ],
                sentry: 8
            }
        },
        objects: [{ array: [ [ 0x1234, 0x4567 ], [ 0x890a, 0xcdef ] ], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'terminated/concat',
        define: {
            object: {
                array: [ [ Buffer ], 0xd, 0xa ],
                sentry: 8
            }
        },
        objects: [{
            array: Buffer.from('abcdefghij'), sentry: 0xaa
        }]
    })
}
