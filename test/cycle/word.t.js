require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay)({
        name: 'word',
        define: {
            object: { word: 32 }
        },
        object: { word: 0xabcdef01 },
        buffer: [ 0xab, 0xcd, 0xef, 0x01 ]
    })
}
