require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'array/words',
        define: {
            object: { array: [ 16, [ 16 ] ]  }
        },
        objects: [{ array: [ 0x1234, 0x4567, 0x890a, 0xcdef ] }]
    })
    require('./cycle')(okay, {
        name: 'array/fixed',
        define: {
            object: { array: [ 16, [{ first: 16, second: 16 }] ]  }
        },
        objects: [{ array: [{ first: 0x1234, second: 0x4567 }, { first: 0x89a0, second: 0xcdef }] }]
    })
    require('./cycle')(okay, {
        name: 'array/nested',
        define: {
            object: { array: [ 16, [[ 16, [ 16 ] ]] ] }
        },
        objects: [{ array: [[ 0x1234, 0x4567 ], [ 1, 2 ]] }]
    })
    require('./cycle')(okay, {
        name: 'array/variable',
        define: {
            object: { array: [ 16, [{ first: [ 16, [ 16 ] ] }] ] }
        },
        objects: [{ array: [{ first:  [ 0x1234, 0x4567 ] }, { first: [ 1, 2 ] }] }]
    })
}
