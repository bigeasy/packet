require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'fixup/both',
        define: {
            object: {
                value: [[ value => -value ], -16, [ value => -value ]]
            }
        },
        objects: [{ value: 1 }]
    })
    require('./cycle')(okay, {
        name: 'fixup/before',
        define: {
            object: {
                value: [[ value => value ], 16 ]
            }
        },
        objects: [{ value: 1 }]
    })
    require('./cycle')(okay, {
        name: 'fixup/after',
        define: {
            object: {
                value: [ 16, [ value => value ]]
            }
        },
        objects: [{ value: 1 }]
    })
}