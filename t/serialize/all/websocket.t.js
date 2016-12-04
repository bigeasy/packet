require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../serialize.all')
    var filename = path.resolve(__filename, '../../../generated/websocket.serialize.all.js')
    var toJSON = require('../../to-json')

    var serializers = { all: {} }
    var structures = []
    structures.push(require('../../language/compiled/websocket.json').parse.shift())

    composer(compiler('serializers', filename), structures)(serializers)

    var buffer = new Buffer(6)
    var object = {
        header: {
            fin: 1, rsv1: 1, rsv2: 1, rsv3: 1, opcode: 1,
            mask: 1, length: 127
        },
        length: 24,
        mask: 0xaa
    }
    var serializer = new serializers.all.object(object)
    assert(serializer.serialize(buffer, 0), {
        start: buffer.length,
        serializer: null
    }, 'start moved')
    assert(toJSON(buffer), [ 241, 255, 0, 24, 0, 170 ], 'serialized')
}
