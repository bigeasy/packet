// https://github.com/bigeasy/packet/issues/590
require('proof')(1, okay => {
    const packetize = require('../../packetize')
    const source = packetize({
        object: {
            numero: 8,
            array: [ 8, [ 8 ] ],
            other: 8
        }
    })
    const mechanics = function () {
        const module = {}
        new Function('module', source)(module)
        return module.exports
    } ()

    const SyncSerializer = require('../../sync/serializer')
    const serializer = new SyncSerializer(mechanics)
    const buffer = serializer.serialize('object', { numero: 1, array: [], other: 1 })
    okay(buffer.toJSON().data, [ 0x1, 0x0, 0x1 ], 'zero length')
})
