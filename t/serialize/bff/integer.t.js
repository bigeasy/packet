require('proof')(6, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var all = require('../../../compose/serializer/all.js')
    var inc = require('../../../compose/serializer/inc.js')
    var filename = {
        bff: path.resolve(__filename, '../../../generated/integer.serialize.bff.js'),
        inc: path.resolve(__filename, '../../../generated/integer.serialize.inc.js')
    }
    var toJSON = require('../../to-json')

    var serializers = { bff: {}, inc: {} }

    all(compiler('serializers', filename.bff), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'integer',
            type: 'integer',
            endianness: 'b',
            bits: 16
        }]
    }], { bff: true })(serializers)
    inc(compiler('serializers', filename.inc), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'integer',
            type: 'integer',
            endianness: 'b',
            bits: 16
        }]
    }])(serializers)

    var bufferLength = 2
    for (var i = 0; i <= bufferLength; i++) {
        var buffer = new Buffer(bufferLength)
        var object = {
            integer: 0xffff
        }
        var serializer = new serializers.bff.object(object)
        var outcome = serializer.serialize(buffer, 0, bufferLength - i)
        if (outcome.serializer != null) {
            outcome = outcome.serializer.serialize(buffer, outcome.start, bufferLength)
        }
        assert(outcome, {
            start: bufferLength,
            serializer: null
        }, 'finished ' + i)
        assert(toJSON(buffer), [ 0xff, 0xff ], 'compiled ' + i)
    }
}
