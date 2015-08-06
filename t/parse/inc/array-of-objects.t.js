require('proof')(20, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var composer = require('../../../compose/parser/inc.js')
    var filename = path.resolve(__filename, '../../../generated/array-of-objects.parse.inc.js')

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
    for (var i = 0; i < buffer.length; i++) {
        var parser = (new f.object)
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
        assert(parser.object, {
            values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
        }, 'compiled')
        assert(engine.start, buffer.length, 'start moved')
    }
}
