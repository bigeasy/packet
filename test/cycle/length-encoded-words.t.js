require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay)({
        name: 'length-encoded-words',
        define: {
            object: { array: [ 16, [ 16 ] ]  }
        },
        object: { array: [ 0x1234, 0x4567, 0x890a, 0xcdef ] },
        stopAt: 'serialize.all'
    })
}
