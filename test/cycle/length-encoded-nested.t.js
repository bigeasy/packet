require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'length-encoded-nested',
        define: {
            object: { array: [ 16, [[ 16, [ 16 ] ]] ] }
        },
        objects: [{ array: [[ 0x1234, 0x4567 ], [ 1, 2 ]] }]
    })
}
