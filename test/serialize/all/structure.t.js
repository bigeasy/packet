require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../serialize.all')
    var filename = path.resolve(__filename, '../../../generated/structure.serialize.all.js')
    var toJSON = require('../../to-json')

    var serializers = { all: {} }

    composer(compiler('serializers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'structure',
            name: 'header',
            fields: [{
                type: 'integer',
                name: 'number',
                endianness: 'b',
                bits: 16
            }]
        }]
    }])(serializers)

    var buffer = new Buffer(2)
    var object = { header: { number: 0xaaaa } }
    var serializer = new serializers.all.object(object)
    assert(serializer.serialize(buffer, 0), {
        start: buffer.length,
        serializer: null
    }, 'start moved')
    assert(toJSON(buffer), [ 0xaa, 0xaa ], 'serialized')
}
