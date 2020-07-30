require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({ packet: { value: -16 } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            bytes: [{
                mask: 255, size: 8, shift: 8, set: 0
            }, {
                mask: 255, size: 8, shift: 0, set: 0
            }],
            endianness: 'big',
            compliment: true
        }]
    }], 'negative')
})
