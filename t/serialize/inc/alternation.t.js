require('proof')(4, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/serializer/inc.js')
    var filename = path.resolve(__filename, '../../../generated/alternation.serialize.inc.js')

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

    var bufferLength = 2
    for (var i = 0; i < bufferLength; i++) {
        var buffer = new Buffer(bufferLength)
        var object = {
            number: 0xffff
        }
        var engine = {
            buffer: buffer,
            start: 0,
            end: bufferLength - i
        }
        var serializer = new serializers.object(object)
        serializer.serialize(engine)
        var engine = {
            buffer: buffer,
            start: bufferLength - i,
            end: bufferLength
        }
        serializer.serialize(engine)
        assert(engine.buffer.toJSON(), [ 0xff, 0xff ], 'compiled')
        assert(engine.start, buffer.length, 'start moved')
    }
}
