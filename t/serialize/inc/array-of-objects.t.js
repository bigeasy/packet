require('proof')(20, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/serializer/inc.js')
    var filename = path.resolve(__filename, '../../../generated/array-of-objects.serialize.inc.js')

    var serializers = composer(compiler(filename), {
        object: {
            values: [{
                $length: {
                    endianess: 'b',
                    bits: 16
                },
                key: {
                    endianess: 'b',
                    bits: 16
                },
                value: {
                    endianess: 'b',
                    bits: 16
                }
            }]
        }
    })
    var buffer = new Buffer(10)
    var object = {
        values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
    }
    var engine = {
        buffer: buffer,
        start: 0,
        end: buffer.length
    }
    var serializer = new serializers.object(object)
    serializer.serialize(engine)
    assert(buffer.toJSON() , [
        0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3
    ], 'compiled')
    assert(engine.start, buffer.length, 'start moved')
}
