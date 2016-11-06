require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.all')
    var filename = path.resolve(__filename, '../../../generated/integer.parse.all')

    var parsers = { all: {} }

    composer(compiler('parsers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'integer',
            type: 'integer',
            endianness: 'b',
            bits: 16
        }]
    }])(parsers)

    var buffer = new Buffer([ 0xab, 0xcd ])
    assert((new parsers.all.object).parse(buffer, 0), {
        start: 2,
        object: { integer: 0xabcd },
        parser: null
    }, 'compiled')
}
