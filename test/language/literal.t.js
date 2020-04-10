require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ '0faded', 16, 'facade' ] } }), [{
        name: 'packet',
        fixed: true,
        bits: 64,
        type: 'structure',
        fields: [{
            type: 'literal',
            fixed: true,
            bits: 24,
            value: '0faded'
        }, {
            name: 'value',
            type: 'integer',
            fixed: true,
            bits: 16,
            endianness: 'big',
            compliment: false
        }, {
            type: 'literal',
            fixed: true,
            bits: 24,
            value: 'facade'
        }]
    }], 'literal')
})
