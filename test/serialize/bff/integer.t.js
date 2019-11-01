require('proof')(6, prove)

function prove (okay) {
    var path = require('path')
    var compiler = require('../../../require')
    var all = require('../../../serialize.all.js')
    var inc = require('../../../serialize.inc.js')
    var filename = {
        bff: path.resolve(__filename, '../../../generated/integer.serialize.bff.js'),
        inc: path.resolve(__filename, '../../../generated/integer.serialize.inc.js')
    }

    var serializers = { bff: {}, inc: {} }

    const generalized = require('../generalized')

    all(compiler('serializers', filename.bff), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'integer',
            type: 'integer',
            endianness: 'big',
            bits: 16
        }]
    }], { bff: true })(serializers)
    inc(compiler('serializers', filename.inc), [{
        type: 'structure',
        name: 'object',
        fields: [{
            name: 'integer',
            type: 'integer',
            endianness: 'big',
            bits: 16
        }]
    }])(serializers)

    generalized(okay, serializers.bff.object, { integer: 0xffff }, [ 0xff, 0xff ])
}
