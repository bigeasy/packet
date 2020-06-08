require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'lookup',
        define: {
            object: { value: [ 8, [ 'off', 'on' ] ] }
        },
        objects: [{ value: 'off' }, { value: 'on' }]
    })
}
