require('proof')(2, prove)

function prove (assert) {
    var cycle = require('./cycle')(assert)

    cycle({
        name: 'little-endian-word',
        define: {
            object: { word: 'l16' }
        },
        object: { word: 0xabcd },
        buffer: [ 0xcd, 0xab ]
    })

    cycle({
        name: 'big-endian-word',
        define: {
            object: { word: 'b16' }
        },
        object: { word: 0xabcd },
        buffer: [ 0xab, 0xcd ]
    })

    cycle({
        name: 'big-endian-integer',
        define: {
            object: { integer: 'b32' }
        },
        object: { integer: 0x89abcdef },
        buffer: [ 0x89, 0xab, 0xcd, 0xef ]
    })
}
