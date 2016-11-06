require('proof')(10, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var all = require('../../../parse.all')
    var inc = require('../../../parse.inc')
    var filename = {
        bff: path.resolve(__filename, '../../../generated/nested.parse.bff'),
        inc: path.resolve(__filename, '../../../generated/nested.parse.inc')
    }

    var parsers = { bff: {}, inc: {} }

    var definition = [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'lengthEncoded',
            name: 'values',
            length: {
                type: 'integer',
                endianness: 'b',
                bits: 16
            },
            element: {
                type: 'structure',
                fields: [{
                    type: 'integer',
                    name: 'key',
                    endianness: 'b',
                    bits: 16
                }, {
                    type: 'integer',
                    name: 'value',
                    endianness: 'b',
                    bits: 16
                }]
            }
        }]
    }]
    inc(compiler('parsers', filename.inc), definition)(parsers)
    all(compiler('parsers', filename.bff), definition, { bff: true })(parsers)

    var buffer = new Buffer([ 0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3 ])
    for (var i = 0; i < buffer.length; i++) {
        var parser = new parsers.bff.object
        var outcome = parser.parse(buffer, 0, buffer.length - i)
        if (outcome.parser != null) {
            outcome = outcome.parser.parse(buffer, outcome.start, buffer.length)
        }
        assert(outcome, {
            start: buffer.length,
            object: { values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ] },
            parser: null
        }, 'complete ' + i)
    }
}
