require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'word',
        define: {
            object: { word: 32 }
        },
        objects: [{ word: 0xabcdef01 }]
    })
}
