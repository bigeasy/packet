require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/parser/all.js')
    var filename = path.resolve(__filename, '../../../generated/nested.parse.all.js')

    var f = composer(compiler(filename), {
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
    var buffer = new Buffer([ 0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3 ])
    var engine = {
        buffer: buffer,
        start: 0,
        end: buffer.length
    }
    assert((new f.object).parse(engine), {
        values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
    }, 'compiled')
    assert(engine.start, buffer.length, 'start moved')
}
