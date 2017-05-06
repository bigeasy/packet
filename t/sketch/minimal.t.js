require('proof')(1, prove)

function prove (assert) {
    var minimal = require('../language/source/minimal.packet.js')
    var Parser = require('../../parse.sketch')
    var Serializer = require('../../serializer.sketch')

    var toJSON = require('../to-json')

    var object = { value: 0xaaaa }

    var serializer = new Serializer(minimal.object, object)

    var buffer = new Buffer(2)
    serializer.write(buffer, 0, buffer.length)

    assert(toJSON(buffer), [ 0xaa, 0xaa ], 'serialize')
}
