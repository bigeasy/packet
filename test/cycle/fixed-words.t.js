require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'fixed',
        define: {
            object: { array: [ [ 16 ], [ 8 ], 0xd, 0xa ]  }
        },
        objects: [{ array: Buffer.from('hello, world').toJSON().data }],
        stopAt: 'parse.bff'
    })
}
