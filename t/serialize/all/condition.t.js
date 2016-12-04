require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../serialize.all')
    var filename = path.resolve(__filename, '../../../generated/condition.serialize.all.js')
    var toJSON = require('../../to-json')

    var serializers = { all: {} }

    composer(compiler('serializers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'integer',
            name: 'flag',
            endianness: 'b',
            bits: 16
        }, {
            type: 'condition',
            conditions: [{
                test: 'object.flag == 16',
                fields: [{
                    type: 'integer',
                    name: 'number',
                    endianness: 'b',
                    bits: 16
                }]
            }, {
                fields: [{
                    type: 'integer',
                    name: 'number',
                    endianness: 'b',
                    bits: 8
                }]
            }]
        }]
    }])(serializers)

    var buffer = new Buffer(4)
    var object = {
        flag: 16,
        number: 0xaaaa
    }
    var serializer = new serializers.all.object(object)
    assert(serializer.serialize(buffer, 0), {
        start: buffer.length,
        serializer: null
    }, 'start moved')
    assert(toJSON(buffer), [ 0x00, 0x10, 0xaa,0xaa ], 'serialized')
}
