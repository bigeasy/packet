require('proof')(22, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var all = require('../../../serialize.all.js')
    var inc = require('../../../serialize.inc.js')
    var toJSON = require('../../to-json.js')
    var filename = {
        bff: path.resolve(__filename, '../../../generated/nested.serialize.bff.js'),
        inc: path.resolve(__filename, '../../../generated/nested.serialize.inc.js')
    }

    var serializers = { bff: {}, inc: {} }
    var definition = [{
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
    }]

    inc(compiler('serializers', filename.inc), definition)(serializers)
    all(compiler('serializers', filename.bff), definition, { bff: true })(serializers)

    var expected = [ 0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3 ]
    for (var i = 0; i <= expected.length; i++) {
        var buffer = new Buffer(expected.length)
        var object = {
            values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
        }
        var serializer = new serializers.bff.object(object)
        var outcome = serializer.serialize(buffer, 0, buffer.length - i)
        if (outcome.serializer != null) {
            outcome = outcome.serializer.serialize(buffer, outcome.start, buffer.length)
        }
        assert(outcome, {
            start: buffer.length,
            serializer: null
        }, 'finished ' + i)
        assert(toJSON(buffer), expected, 'compiled ' + i)
    }
}
