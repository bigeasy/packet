require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/parser/all.js')
    var filename = path.resolve(__filename, '../../../generated/alternation.parse.all.js')

    var parsers = composer(compiler(filename), {
        object: {
            number: {
                type: 'alternation',
                select: { endianess: 'b', bits: 8 },
                choose: [{
                    read: {
                        when: { and: 0x80 },
                        endianess: 'b',
                        bits: 16
                    },
                    write: {
                        when: { range: { from: 0x80 }  },
                        endianess: 'b',
                        bits: 16
                    }
                }, {
                    read: {
                        endianess: 'b',
                        bits: 8
                    },
                    write: {
                        endianess: 'b',
                        bits: 8
                    }
                }]
            }
        }
    })
    var buffer = new Buffer([ 0xff, 0xff ])
    var engine = {
        buffer: buffer,
        start: 0,
        end: buffer.length
    }
    assert((new parsers.object).parse(engine), {
        number: 0xffff
    }, 'compiled')
    assert(engine.start, buffer.length, 'start moved')
}
