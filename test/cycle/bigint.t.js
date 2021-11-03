require('proof')(544, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'bigint/be/long',
        define: {
            object: {
                nudge: 8,
                value: 64n,
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            value: 0xaaaaaaaaaaaaaaaan,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'bigint/be/compliment',
        define: {
            object: {
                nudge: 8,
                value: -64n,
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            value: 0x7aaaaaaaaaaaaaaan,
            sentry: 0xaa
        }, {
            nudge: 0xaa,
            value: -1n,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'bigint/le/long',
        define: {
            object: {
                nudge: 8,
                value: ~64n,
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            value: 0xaaaaaaaaaaaaaaaan,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'bigint/le/compliment',
        define: {
            object: {
                nudge: 8,
                value: ~-64n,
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            value: 0x7aaaaaaaaaaaaaaan,
            sentry: 0xaa
        }, {
            nudge: 0xaa,
            value: -1n,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'bigint/le/alternate',
        define: {
            object: {
                nudge: 8,
                value: -~64n,
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            value: 0x7aaaaaaaaaaaaaaan,
            sentry: 0xaa
        }, {
            nudge: 0xaa,
            value: -1n,
            sentry: 0xaa
        }]
    })
}
