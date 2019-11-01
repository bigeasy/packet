require('proof')(22, prove)

function prove (okay) {
    var path = require('path')
    var compiler = require('../../../require')
    var all = require('../../../serialize.all.js')
    var inc = require('../../../serialize.inc.js')
    var toJSON = require('../../to-json.js')
    var filename = {
        bff: path.resolve(__filename, '../../../generated/nested.serialize.bff.js'),
        inc: path.resolve(__filename, '../../../generated/nested.serialize.inc.js')
    }

    var serializers = { bff: {}, inc: {} }
    var definition = [{
        type: 'structure',
        name: 'object',
        fields: [{
            type: 'lengthEncoded',
            name: 'values',
            length: {
                type: 'integer',
                endianness: 'big',
                bits: 16
            },
            element: {
                type: 'structure',
                fields: [{
                    type: 'integer',
                    name: 'key',
                    endianness: 'big',
                    bits: 16
                }, {
                    type: 'integer',
                    name: 'value',
                    endianness: 'big',
                    bits: 16
                }]
            }
        }]
    }]

    inc(compiler('serializers', filename.inc), definition)(serializers)
    all(compiler('serializers', filename.bff), definition, { bff: true })(serializers)

    const generalized = require('../generalized')

    generalized(okay, serializers.bff.object, {
        values: [ { key: 2570, value: 1 }, { key: 2, value: 3 } ]
    }, [ 0x0, 0x2, 0xa, 0xa, 0x0, 0x1, 0x0, 0x2, 0x0, 0x3 ])
}
