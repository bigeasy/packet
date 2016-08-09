require('proof')(20, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/parser/inc.js')
    var filename = path.resolve(__filename, '../../../generated/nested.parse.inc.js')

    var parsers = composer(compiler(filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'lengthEncoded',
            name: 'values',
            length: {
                type: 'integer',
                endianness: 'b',
                bits: 16
            },
            element: {
                type: 'structure',
                fields: [{
                    type: 'integer',
                    name: 'key',
                    endianness: 'b',
                    bits: 16
                }, {
                    type: 'integer',
                    name: 'value',
                    endianness: 'b',
                    bits: 16
                }]
            }
        }]
    }])

    var buffer = new Buffer([ 0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3 ])
    for (var i = 0; i < buffer.length; i++) {
        var parser = (new parsers.object)
        var first = parser.parse(buffer, 0, buffer.length - i)
        assert(first.start, buffer.length - i, 'incremental ' + i)
        assert(parser.parse(buffer, buffer.length - i, buffer.length), {
            start: buffer.length,
            object: { values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ] },
            parser: null,
        }, 'compiled ' + i)
    }
}
