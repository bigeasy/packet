require('proof')(1, prove)

function prove (assert) {
    var transmogrify = require('../../transmogrifier')
    assert(transmogrify({
        object: { bite: 'b8' }
    }), [{
        name: 'object',
        type: 'structure',
        fields: [{
            name: 'bite',
            type: 'integer',
            bits: 8,
            endianess: 'b'
        }]
    }], 'byte')
}
