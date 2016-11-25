require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.all')
    var filename = path.resolve(__filename, '../../../generated/alternation.parse.all')

    var parsers = { all: {} }

// TODO Obviously, this would be better as a buffer instead of an array.
// TODO Maybe type `byte` creates an array?
    composer(compiler('parsers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'terminated',
            name: 'string',
            terminator: [ 0xd, 0xa ],
            element: {
                type: 'integer',
                endianness: 'b',
                bits: 8
            }
        }]
    }])(parsers)

    var buffer = new Buffer([ 0x61, 0x62, 0x63, 0xd, 0xa ])
    assert((new parsers.all.object).parse(buffer, 0), {
        start: buffer.length,
        object: { string: [ 0x61, 0x62, 0x63 ] },
        parser: null
    }, 'compiled')
}
