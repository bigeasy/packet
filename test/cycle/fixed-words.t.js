require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'array',
        define: {
            object: { array: [ 0xaa, 0xaa, [ 4 ], [ 16 ] ]  }
        },
        objects: [{ array: [ 0x0012, 0x4567, 0x890a ] }],
        stopAt: 'sizeof'
    })
}
