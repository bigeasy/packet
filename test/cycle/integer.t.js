require('proof')(0, prove)

function prove (okay) {
    var cycle = require('./cycle')(okay)

    cycle({
        name: 'byte',
        define: {
            object: { word: 8 }
        },
        object: { word: 0xab },
        buffer: [ 0xab ]
    })

    /*
    cycle({
        name: 'little-endian-word',
        define: {
            object: { word: ~16 }
        },
        object: { word: 0xabcd },
        buffer: [ 0xcd, 0xab ]
    })

    cycle({
        name: 'big-endian-word',
        define: {
            object: { word: 16 }
        },
        object: { word: 0xabcd },
        buffer: [ 0xab, 0xcd ]
    })

    cycle({
        name: 'big-endian-integer',
        define: {
            object: { integer: 32 }
        },
        object: { integer: 0x89abcdef },
        buffer: [ 0x89, 0xab, 0xcd, 0xef ]
    })

    cycle({
        name: 'little-endian-integer',
        define: {
            object: { integer: ~32 }
        },
        object: { integer: 0x89abcdef },
        buffer: [ 0xef, 0xcd, 0xab, 0x89 ]
    })
        */
}
