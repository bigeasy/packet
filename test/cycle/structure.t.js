require('proof')(52, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'structure/nested',
        define: {
            object: {
                value: {
                    first: 8,
                    second: 8
                },
                sentry: 8
            }
        },
        objects: [{ value: { first: 1, second: 2 }, sentry: 0xaa }]
    })
    require('./cycle')(okay, {
        name: 'structure/elided',
        define: {
            object: {
                _value: {
                    first: 8,
                    second: 8
                },
                sentry: 8
            }
        },
        objects: [{ first: 1, second: 2, sentry: 0xaa }]
    })
}
