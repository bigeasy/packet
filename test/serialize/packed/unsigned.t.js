require('../../proof')(1, function (packet, deepEqual) {
    var buffer = new Buffer(2)
    var serializer = packet.createSerializer('b16{a: b4, b: b8, c: b4}')
    var object = {
        write: serializer({ a: 0xa, b: 0xaa, c: 0xa })
    }
    object.write(buffer, 0, buffer.length)
    deepEqual(buffer.toJSON(), [ 0xaa, 0xaa ], 'pack')
})
