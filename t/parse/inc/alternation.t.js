require('proof')(4, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.inc')
    var filename = path.resolve(__filename, '../../../generated/alternation.parse.inc.js')

    var parsers = { inc: {} }

    composer(compiler('parsers', filename), [{
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
                        endianess: 'b',
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
    }])(parsers)

    var buffer = new Buffer([ 0xff, 0xff ])
    for (var i = 0; i < buffer.length; i++) {
        var parser = (new parsers.inc.object)
        var first = parser.parse(buffer, 0, buffer.length - i)
        assert(first.start, buffer.length - i, 'inremental start ' + i)
        assert(parser.parse(buffer, buffer.length - i, buffer.length), {
            start: buffer.length,
            object: { number: 0xffff },
            parser: null
        }, 'complete ' + i)
    }
}
