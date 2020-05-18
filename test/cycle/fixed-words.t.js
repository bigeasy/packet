require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'array',
        define: {
            object: { array: [ 0xd, 0xa, [ 16 ], [ 8 ] ]  }
        },
        objects: [{ array: Buffer.from('hello, world').toJSON().data }],
        stopAt: 'serialize.all'
    })
}
