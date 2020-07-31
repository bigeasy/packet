require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({ packet: { value: 16 } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 16,
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'integer',
            vivify: 'number',
            fixed: true,
            bits: 16,
            bytes: [{
                mask: 255, size: 8, shift: 8, upper: 0
            }, {
                mask: 255, size: 8, shift: 0, upper: 0
            }],
            endianness: 'big',
            compliment: false
        }]
    }], 'minimal')
})
