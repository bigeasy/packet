require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'length-encoded-variable',
        define: {
            object: { array: [ 16, [{ first: [ 16, [ 16 ] ] }] ] }
        },
        objects: [{ array: [{ first:  [ 0x1234, 0x4567 ] }, { first: [ 1, 2 ] }] }]
    })
}
