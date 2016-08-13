require('proof')(6, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/serializer/inc.js')
    var filename = path.resolve(__filename, '../../../generated/alternation.serialize.inc.js')
    var toJSON = require('../../to-json')

    var serializers = composer(compiler(filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'alternation',
            name: 'number',
            select: {
                type: 'integer',
                endianness: 'b',
                bits: 8
            },
            choose: [{
                read: {
                    when: { and: 0x80 },
                    field: {
                        type: 'integer',
                        endianness: 'b',
                        bits: 16
                    }
                },
                write: {
                    when: { range: { from: 0x80 }  },
                    field: {
                        type: 'integer',
                        endianness: 'b',
                        bits: 16
                    }
                }
            }, {
                read: {
                    field: {
                        type: 'integer',
                        endianness: 'b',
                        bits: 8
                    }
                },
                write: {
                    field: {
                        type: 'integer',
                        endianness: 'b',
                        bits: 8
                    }
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
        var serializer = new serializers.object(object)
        var first = serializer.serialize(buffer, 0, bufferLength - i)
        assert(first.start, bufferLength - i, 'correct start ' + i)
        assert(serializer.serialize(buffer, bufferLength - i, bufferLength), {
            start: bufferLength,
            serializer: null
        }, 'finished ' + i)
        assert(toJSON(buffer), [ 0xff, 0xff ], 'compiled ' + i)
    }
}
