require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'skip',
        define: {
            object: {
                padded: [[ '0faded', 2 ], 16, [ 'facade', 2 ]]
            }
        },
        objects: [{ padded: 0xabcd }]
    })
}
