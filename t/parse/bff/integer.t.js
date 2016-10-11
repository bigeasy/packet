require('proof')(2, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../compiler/require')
    var all = require('../../../compose/parser/all.js')
    var inc = require('../../../compose/parser/inc.js')
    var filename = {
        bff: path.resolve(__filename, '../../../generated/integer.parse.bff.js'),
        inc: path.resolve(__filename, '../../../generated/integer.parse.inc.js')
    }

    var parsers = { bff: {}, inc: {} }

    all(compiler('parsers', filename.bff), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'integer',
            type: 'integer',
            endianness: 'b',
            bits: 16
        }]
    }], { bff: true })(parsers)
    inc(compiler('parsers', filename.inc), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'integer',
            type: 'integer',
            endianness: 'b',
            bits: 16
        }]
    }])(parsers)

    var buffer = new Buffer([ 0xff, 0xff ])
    for (var i = 0; i < buffer.length; i++) {
        var parser = new parsers.bff.object
        var outcome = parser.parse(buffer, 0, buffer.length - i)
        if (outcome.parser != null) {
            outcome = outcome.parser.parse(buffer, outcome.start, buffer.length)
        }
        assert(outcome, {
            start: buffer.length,
            object: { integer: 0xffff },
            parser: null
        }, 'complete ' + i)
    }
}
