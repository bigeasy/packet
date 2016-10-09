require('proof')(1, prove)

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

    var buffer = new Buffer([ 0xab, 0xcd ])
    var parser = new parsers.bff.object
    var outcome
    outcome = parser.parse(buffer, 0, 1)
    outcome = outcome.parser.parse(buffer, outcome.start, 1)
    outcome = outcome.parser.parse(buffer, 1, 2)
    assert(outcome, {
        start: 2,
        object: { integer: 0xabcd },
        parser: null
    }, 'compiled')
}
