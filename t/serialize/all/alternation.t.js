require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/serializer/all.js')
    var filename = path.resolve(__filename, '../../../generated/alternation.serialize.all.js')

    var serializers = composer(compiler(filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'alternation',
            name: 'number',
            select: {
                type: 'integer',
                endianess: 'b',
                bits: 8
            },
            choose: [{
                read: {
                    when: { and: 0x80 },
                    type: 'integer',
                    endianess: 'b',
                    bits: 16
                },
                write: {
                    when: { range: { from: 0x80 }  },
                    type: 'integer',
                    endianess: 'b',
                    bits: 16
                }
            }, {
                read: {
                    type: 'integer',
                    endianess: 'b',
                    bits: 8
                },
                write: {
                    type: 'integer',
                    endianess: 'b',
                    bits: 8
                }
            }]
        }]
    }])

    var buffer = new Buffer(2)
    var object = {
        number: 0xffff
    }
    var engine = {
        buffer: buffer,
        start: 0,
        end: buffer.length
    }
    var serializer = new serializers.object(object)
    serializer.serialize(engine)
    assert(buffer.toJSON(), [ 0xff, 0xff ], 'compiled')
    assert(engine.start, buffer.length, 'start moved')
}
