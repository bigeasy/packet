require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.all')
    var filename = path.resolve(__filename, '../../../generated/string.parse.all.js')

    var parsers = { all: {} }

    composer(compiler('parsers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'string',
            type: 'buffer',
            terminator: [0],
            tranform: 'utf8'
        }]
    }])(parsers)

    var buffer = new Buffer([ 0x61, 0x62, 0x63, 0xf0, 0x9f, 0x91, 0x8b, 0x00 ])
    assert((new parsers.all.object).parse(buffer, 0), {
        start: 8,
        object: { string: 'abc👋' },
        parser: null
    }, 'compiled')
}
