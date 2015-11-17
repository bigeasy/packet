require('proof')(4, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/parser/inc.js')
    var filename = path.resolve(__filename, '../../../generated/alternation.parse.inc.js')

    var parsers = composer(compiler(filename), [{
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

    var buffer = new Buffer([ 0xff, 0xff ])
    for (var i = 0; i < buffer.length; i++) {
        var parser = (new parsers.object)
        var engine = {
            buffer: buffer,
            start: 0,
            end: buffer.length - i
        }
        parser.parse(engine)
        var engine = {
            buffer: buffer,
            start: buffer.length - i,
            end: buffer.length
        }
        parser.parse(engine)
        assert(parser.object, { number: 0xffff }, 'compiled')
        assert(engine.start, buffer.length, 'start moved')
    }
}
