require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'miscelaneous/include',
        define: {
            $value: [ 8, [ 8 ] ],
            object: {
                nudge: 8,
                value: '$value',
                sentry: 8
            }
        },
        objects: [{ nudge: 0xaa, value: [ 0xa, 0xb, 0xc, 0xd ], sentry: 0xaa }]
    })
}
