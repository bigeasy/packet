require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../../require')
    var composer = require('../../../parse.inc')
    var filename = path.resolve(__filename, '../../../generated/condition.parse.inc.js')

    var parsers = { inc: {} }

    composer(compiler('parsers', filename), [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'integer',
            name: 'flag',
            endianness: 'b',
            bits: 16
        }, {
            type: 'condition',
            conditions: [{
                test: 'object.flag == 16',
                fields: [{
                    type: 'integer',
                    name: 'number',
                    endianness: 'b',
                    bits: 16
                }]
            }, {
                fields: [{
                    type: 'integer',
                    name: 'number',
                    endianness: 'b',
                    bits: 8
                }]
            }]
        }]
    }])(parsers)

    var buffer = new Buffer([ 0x00, 0x08, 0x00 ])
    assert((new parsers.inc.object).parse(buffer, 0), {
        start: buffer.length,
        object: { flag: 8, number: 0 },
        parser: null
    }, 'compiled')
}
