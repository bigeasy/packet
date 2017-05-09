require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../serialize.all')
    var filename = path.resolve(__filename, '../../../generated/string.serialize.all.js')
    var toJSON = require('../../to-json')

    var serializers = { all: {} }

    composer(compiler('serializers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'buffer',
            name: 'string',
            terminator: [0],
            transform: 'utf8'
        }]
    }])(serializers)

    var buffer = []
    var object = { string: 'abc👋' }
    var serializer = new serializers.all.object(object)
    assert(serializer.serialize(buffer, 0), {
        start: buffer.length,
        serializer: null
    }, 'start moved')
    buffer = new Buffer(buffer)
    assert(toJSON(buffer), [ 0x61, 0x62, 0x63, 0xf0, 0x9f, 0x91, 0x8b, 0x00 ], 'serialized')
}
