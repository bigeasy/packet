require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'structure',
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
}
