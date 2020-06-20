require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'lookup',
        define: {
            object: { value: [ 8, [ 'off', 'on' ] ], sentry: 8 }
        },
        objects: [{ value: 'off', sentry: 0xaa }, { value: 'on', sentry: 0xaa }]
    })
}
