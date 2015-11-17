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
                endianess: 'b',
                bits: 16
            },
            element: {
                type: 'structure',
                fields: [{
                    type: 'integer',
                    name: 'key',
                    endianess: 'b',
                    bits: 16
                }, {
                    type: 'integer',
                    name: 'value',
                    endianess: 'b',
                    bits: 16
                }]
            }
        }]
    }])

    var buffer = new Buffer([ 0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3 ])
    for (var i = 0; i < buffer.length; i++) {
        var parser = (new parsers.object)
        var engine = {
            buffer: buffer,
            start: 0,
            end: buffer.length - i
        }
        parser.parse(engine)
        var engine = {
            buffer: buffer,
            start: buffer.length - i,
            end: buffer.length
        }
        parser.parse(engine)
        assert(parser.object, {
            values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
        }, 'compiled')
        assert(engine.start, buffer.length, 'start moved')
    }
}
