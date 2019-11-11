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
}
