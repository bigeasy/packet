require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.all')
    var filename = path.resolve(__filename, '../../../generated/structure.parse.all.js')

    var parsers = { all: {} }

    composer(compiler('parsers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'structure',
            name: 'header',
            fields: [{
                type: 'integer',
                name: 'number',
                endianness: 'b',
                bits: 16
            }]
        }]
    }])(parsers)

    var buffer = new Buffer([ 0xaa, 0xaa ])
    assert((new parsers.all.object).parse(buffer, 0), ({
        start: buffer.length,
        object: { header: { number: 0xaaaa } },
        parser: null
    }), 'compiled')
}
