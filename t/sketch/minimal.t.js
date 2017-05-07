require('proof')(3, require('cadence')(prove))

function prove (async, assert) {
    var minimal = require('../language/source/minimal.packet.js')
    var Parser = require('../../parser.sketch')
    var Serializer = require('../../serializer.sketch')

    var toJSON = require('../to-json')

    var object = { value: 0xaaaa }

    var serializer = new Serializer(minimal.object, object)

    var buffer = new Buffer(2)
    serializer.write(buffer, 0, buffer.length)

    assert(toJSON(buffer), [ 0xaa, 0xaa ], 'serialize')

    var parser = new Parser(minimal.object)
    parser.parse(buffer, 0, buffer.length)

    assert(parser.object, { value: 0xaaaa }, 'parse')

    var stream = require('stream')
    var Puller = require('../../puller')
    var through = new stream.PassThrough
    var puller = new Puller(through)

    async(function () {
        puller.parse(minimal.object, async())
        through.write(buffer)
    }, function (object) {
        assert(object, { value: 0xaaaa }, 'puller parse')
    })
}
