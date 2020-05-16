require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: ~16 } }), [{
        name: 'packet',
        fixed: true,
        bits: 16,
        type: 'structure',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'integer',
            fixed: true,
            bits: 16,
            endianness: 'little',
            compliment: false
        }]
    }], 'little-endian')
})
