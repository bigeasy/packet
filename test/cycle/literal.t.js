require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    // TODO Not consistent. If there is no trailing constant, i.e. `[ '0faded', 16 ]`
    // then it going to be a constant that repeats 16 times. This should go.
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
    cycle(okay, {
        name: 'literal/constant',
        define: {
            object: {
                nudge: 8,
                constant: [ 'fc' ],
                sentry: 8
            }
        },
        objects: [{ nudge: 0xaa, sentry: 0xaa }]
    })
}
