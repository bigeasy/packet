require('proof')(5, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.inc')
    var filename = path.resolve(__filename, '../../../generated/structure.parse.inc.js')

    var parsers = { inc: {} }

    composer(compiler('parsers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'structure',
            name: 'header',
            fields: [{
                type: 'integer',
                name: 'number',
                endianness: 'b',
                bits: 16
            }]
        }]
    }])(parsers)

    var buffer = new Buffer([ 0xaa, 0xaa ])
    for (var i = 0; i <= buffer.length; i++) {
        var parser = (new parsers.inc.object)
        var first = parser.parse(buffer, 0, buffer.length - i)
        assert(first.start, buffer.length - i, 'incremental ' + i)
        if (first.parser != null) {
            assert(first.parser.parse(buffer, buffer.length - i, buffer.length), {
                start: buffer.length,
                object: { header: { number: 0xaaaa } },
                parser: null
            }, 'compiled ' + i)
        }
    }
}
