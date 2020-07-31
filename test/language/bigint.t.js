require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({ packet: { value: 64n } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 64,
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'bigint',
            vivify: 'bigint',
            fixed: true,
            bits: 64,
            bytes: [{
                shift: 56, size: 8, mask: 255, upper: 0
            }, {
                shift: 48, size: 8, mask: 255, upper: 0
            }, {
                shift: 40, size: 8, mask: 255, upper: 0
            }, {
                shift: 32, size: 8, mask: 255, upper: 0
            }, {
                shift: 24, size: 8, mask: 255, upper: 0
            }, {
                shift: 16, size: 8, mask: 255, upper: 0
            }, {
                shift: 8, size: 8, mask: 255, upper: 0
            }, {
                shift: 0, size: 8, mask: 255, upper: 0
            }],
            endianness: 'big',
            compliment: false
        }]
    }], 'bigint')
    return
    okay(language({ packet: { value: ~16 } }), [{
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
                size: 8, shift: 0, mask: 255, upper: 0
            }, {
                size: 8, shift: 8, mask: 255, upper: 0
            }],
            endianness: 'little',
            compliment: false
        }]
    }], 'little endian')
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
            bytes: [
                { size: 8, shift: 8, mask: 255, upper: 0 },
                { size: 8, shift: 0, mask: 255, upper: 0 }
            ],
            endianness: 'big',
            compliment: true
        }]
    }], 'two\'s compliment')
    okay(language({ packet: { value: -~16 } }), [{
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
                size: 8, shift: 0, mask: 255, upper: 0
            }, {
                size: 8, shift: 8, mask: 255, upper: 0
            }],
            endianness: 'little',
            compliment: true
        }]
    }], 'two\'s compliment little endian')
    okay(language({ packet: { value: ~-16 } }), [{
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
            bytes: [
                { size: 8, shift: 0, mask: 255, upper: 0 },
                { size: 8, shift: 8, mask: 255, upper: 0 }
            ],
            endianness: 'little',
            compliment: true
        }]
    }], 'two\'s compliment little endian transposed')
    okay(language({ packet: { value: [ 16, 7, 7 ] } }), [{
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
                size: 7, shift: 7, mask: 127, upper: 0
            }, {
                size: 7, shift: 0, mask: 127, upper: 0
            }],
            endianness: 'big',
            compliment: false
        }]
    }], 'spread')
    okay(language({ packet: { value: [ 16, 0x80, 7, 0x0, 7 ] } }), [{
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
            bytes: [
                { size: 7, shift: 7, mask: 127, upper: 128 },
                { size: 7, shift: 0, mask: 127, upper: 0 }
            ],
            endianness: 'big',
            compliment: false
        }]
    }], 'spread set')
})
