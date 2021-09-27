require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'absent/null',
        define: {
            object: {
                value: null
            }
        },
        objects: [{ value: null }]
    })
    require('./cycle')(okay, {
        name: 'absent/array',
        define: {
            object: {
                value: []
            }
        },
        objects: [{ value: [] }]
    })
    require('./cycle')(okay, {
        name: 'absent/switch',
        define: {
            object: {
                value: [ $ => 0, [
                    { $_: 0 }, null,
                    {}, null
                ]]
            }
        },
        objects: [{ value: null }]
    })
}
