require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'literal/single',
        define: {
            object: {
                nudge: 8,
                padded: [ '0faded', 16, 'facade' ],
                sentry: 8
            }
        },
        objects: [{ nudge: 0xaa, padded: 0xabcd, sentry: 0xaa }],
    })
    cycle(okay, {
        name: 'literal/repeated',
        define: {
            object: {
                nudge: 8,
                padded: [[ '0faded', 2 ], 16, [ 'facade', ~2 ]],
                sentry: 8
            }
        },
        objects: [{ nudge: 0xaa, padded: 0xabcd, sentry: 0xaa }]
    })
}
