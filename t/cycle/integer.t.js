require('proof')(1, prove)

function prove (assert) {
    var cycle = require('./cycle')(assert)

    cycle({
        name: 'little-endian-word',
        define: {
            object: { word: 'l16' }
        },
        object: { word: 0xaaaa },
        buffer: [ 0xaa, 0xaa ]
    })
}
