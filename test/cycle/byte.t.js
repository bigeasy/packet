require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay)({
        name: 'byte',
        define: {
            object: { word: 8 }
        },
        object: { word: 0xab },
        buffer: [ 0xab ]
    })
}
