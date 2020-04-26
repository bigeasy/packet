require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'negative-16bit',
        define: {
            object: { word: -16 }
        },
        objects: [{ word: -2 }]
    })
    require('./cycle')(okay, {
        name: 'negative-32bit',
        define: {
            object: { word: -32 }
        },
        objects: [{ word: -2 }]
    })
}
