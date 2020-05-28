require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'fixed',
        define: {
            object: { array: [ [ 4 ], [ 16 ] ]  }
        },
        objects: [{ array: [ 0xabcd, 0xdcba, 0xabcd, 0xdbca ] }]
    })
}
