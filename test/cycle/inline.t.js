require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'fixup/both',
        define: {
            object: {
                value: [[ value => -value ], -16, [ value => -value ]],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    require('./cycle')(okay, {
        name: 'fixup/before',
        define: {
            object: {
                value: [[ value => value ], 16 , []],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    require('./cycle')(okay, {
        name: 'fixup/after',
        define: {
            object: {
                value: [[], 16, [ value => value ]],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
}
