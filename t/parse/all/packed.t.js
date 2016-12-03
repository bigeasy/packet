require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.all')
    var filename = path.resolve(__filename, '../../../generated/packed.parse.all.js')

    var parsers = { all: {} }

    composer(compiler('parsers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'integer',
            endianness: 'b',
            bits: 16,
            fields: [{
                name: 'first',
                endianness: 'b',
                bits: 1
            }, {
                name: 'second',
                endianness: 'b',
                bits: 3
            }, {
                name: 'third',
                endianness: 'b',
                bits: 12
            }]
        }]
    }])(parsers)

    var buffer = new Buffer([ 0xab, 0xcd ])
    assert((new parsers.all.object).parse(buffer, 0), {
        start: 2,
        object: { first: 1, second: 2, third: 3021 },
        parser: null
    }, 'compiled')
}
