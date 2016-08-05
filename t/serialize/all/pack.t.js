require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/serializer/all.js')
    var filename = path.resolve(__filename, '../../../generated/packing.serialize.all.js')
    var toJSON = require('../../to-json')

    var serializers = composer(compiler(filename), [{
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
    }])

    var buffer = new Buffer(2)
    var object = { flag: 1, number: 0x1 }
    var engine = {
        buffer: buffer,
        start: 0,
        end: buffer.length
    }
    var serializer = new serializers.object(object)
    serializer.serialize(engine)
    assert(toJSON(engine.buffer), [ 0x80, 0x01 ], 'compiled')
    assert(engine.start, buffer.length, 'start moved')
}
