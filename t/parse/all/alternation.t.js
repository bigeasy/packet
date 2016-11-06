require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.all')
    var filename = path.resolve(__filename, '../../../generated/alternation.parse.all')

    var parsers = { all: {} }

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
    }])(parsers)

    var buffer = new Buffer([ 0xff, 0xff ])
    assert((new parsers.all.object).parse(buffer, 0), {
        start: buffer.length,
        object: { number: 0xffff },
        parser: null
    }, 'compiled')
}
