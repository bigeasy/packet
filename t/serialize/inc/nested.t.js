require('proof')(30, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/serializer/inc.js')
    var toJSON = require('../../to-json.js')
    var filename = path.resolve(__filename, '../../../generated/nested.serialize.inc.js')

    var serializers = { inc: {} }

    composer(compiler('serializers', filename), [{
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
    }])(serializers)

    var bufferLength = 10
    for (var i = 0; i < bufferLength; i++) {
        var buffer = new Buffer(bufferLength)
        var object = {
            values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
        }
        var serializer = new serializers.inc.object(object)
        var first = serializer.serialize(buffer, 0, bufferLength - i)
        assert(first.start, bufferLength - i, 'correct start ' + i)
        assert(serializer.serialize(buffer, bufferLength - i, bufferLength), {
            start: bufferLength,
            serializer: null
        }, 'finished ' + i)
        assert(toJSON(buffer), [
            0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3
        ], 'compiled ' + i)
    }
}
