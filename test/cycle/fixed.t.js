require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'fixed/words',
        define: {
            object: { array: [ [ 4 ], [ 16 ] ], sentry: 8  }
        },
        objects: [{ array: [ 0xabcd, 0xdcba, 0xabcd, 0xdbca ], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'fixed/concat',
        define: {
            object: {
                array: [ [ 8 ], [ Buffer ] ],
                sentry: 8
            }
        },
        objects: [{ array: Buffer.from('abcdefgh'), sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'fixed/padded',
        define: {
            object: { array: [ [ 16 ], [ 8 ], 0xd, 0xa ], sentry: 8  }
        },
        objects: [{ array: Buffer.from('hello, world').toJSON().data, sentry: 0xaa }]
    })
}
