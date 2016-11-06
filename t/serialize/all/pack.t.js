require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../serialize.all')
    var filename = path.resolve(__filename, '../../../generated/packing.serialize.all')
    var toJSON = require('../../to-json')

    var serializers = { all: {} }

    composer(compiler('serializers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'integer',
            endianness: 'b',
            bits: 16,
            packing: [{
                type: 'integer',
                name: 'flag',
                endianness: 'b',
                bits: 1
            }, {
                type: 'integer',
                name: 'number',
                endianness: 'b', // TODO Spell out 'big'.
                bits: 15
            }]
        }]
    }])(serializers)

    var buffer = new Buffer(2)
    var object = { flag: 1, number: 0x1 }
    var serializer = new serializers.all.object(object)
    assert(serializer.serialize(buffer, 0), {
        start: buffer.length,
        serializer: null
    }, 'start moved')
    assert(toJSON(buffer), [ 0x80, 0x01 ], 'serialized')
}
