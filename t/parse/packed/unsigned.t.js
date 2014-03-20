require('../../proof')(1, function (packet, deepEqual) {
    var buffer = new Buffer([ 0xaa, 0xaa ])
    var parser = packet.createParser('b16{a: b4, b: b8, c: b4}')
    var object = {
        parse: parser({}, function (object) {
            deepEqual(object, { a: 0xa, b: 0xaa, c: 0xa }, 'pack')
        })
    }
    object.parse(buffer, 0, buffer.length)
})
