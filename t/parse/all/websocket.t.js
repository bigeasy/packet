require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.all')
    var filename = path.resolve(__filename, '../../../generated/websocket.parse.all.js')

    var parsers = { all: {} }
    var structures = []
    structures.push(require('../../language/compiled/websocket.json').parse.shift())

    composer(compiler('parsers', filename), structures)(parsers)

    var buffer = new Buffer([ 0xff, 0xff ])
    var buffer = new Buffer([ 241, 255, 0, 24, 0, 170 ])
    assert((new parsers.all.object).parse(buffer, 0), {
        start: buffer.length,
        object: {
            header: {
                fin: 1, rsv1: 1, rsv2: 1, rsv3: 1, opcode: 1,
                mask: 1, length: 127
            },
            length: 24,
            mask: 0xaa
        },
        parser: null
    }, 'compiled')
}
