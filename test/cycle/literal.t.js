require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'literal/single',
        define: {
            object: {
                padded: [ '0faded', 16, 'facade' ],
                sentry: 8
            }
        },
        objects: [{ padded: 0xabcd, sentry: 0xaa }],
    })
    cycle(okay, {
        name: 'literal/repeated',
        define: {
            object: {
                padded: [[ '0faded', 2 ], 16, [ 'facade', 2 ]],
                sentry: 8
            }
        },
        objects: [{ padded: 0xabcd, sentry: 0xaa }]
    })
}
