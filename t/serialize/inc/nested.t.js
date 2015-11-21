require('proof')(20, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/serializer/inc.js')
    var filename = path.resolve(__filename, '../../../generated/nested.serialize.inc.js')

    var serializers = composer(compiler(filename), [{
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

    var bufferLength = 10
    for (var i = 0; i < bufferLength; i++) {
        var buffer = new Buffer(bufferLength)
        var object = {
            values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
        }
        var engine = {
            buffer: buffer,
            start: 0,
            end: bufferLength - i
        }
        var serializer = new serializers.object(object)
        serializer.serialize(engine)
        var engine = {
            buffer: buffer,
            start: bufferLength - i,
            end: bufferLength
        }
        serializer.serialize(engine)
        assert(engine.buffer.toJSON(), [
            0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3
        ], 'compiled')
        assert(engine.start, buffer.length, 'start moved')
    }
}
