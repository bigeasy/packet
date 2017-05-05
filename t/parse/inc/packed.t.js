require('proof')(5, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.inc')
    var filename = path.resolve(__filename, '../../../generated/packed.parse.inc.js')

    var parsers = { inc: {} }

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
    for (var i = 0; i <= buffer.length; i++) {
        var parser = (new parsers.inc.object)
        var first = parser.parse(buffer, 0, buffer.length - i)
        assert(first.start, buffer.length - i, 'incremental ' + i)
        if (first.parser != null) {
            assert(first.parser.parse(buffer, buffer.length - i, buffer.length), {
                start: 2,
                object: { first: 1, second: 2, third: 3021 },
                parser: null
            }, 'compiled ' + i)
        }
    }
}
