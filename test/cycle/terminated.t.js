require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'terminated',
        define: {
            object: { array: [ [ 16 ], 0x0, 0x0 ]  }
        },
        objects: [{ array: [ 0x1234, 0x4567, 0x890a, 0xcdef ] }],
        stopAt: 'parse.inc'
    })
}
