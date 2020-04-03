require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay)({
        name: 'length-encoded-variable',
        define: {
            object: { array: [ 16, [{ first: [ 16, [ 16 ] ] }] ] }
        },
        object: { array: [{ first:  [ 0x1234, 0x4567 ] }] },
        stopAt: 'serialize.bff'
    })
}
