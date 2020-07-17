require('proof')(3, okay => {
    const language = require('../../language')
    okay(language({ packet: {
        value: [ [ 4 ], [ 16 ], 0x0d, 0x0a ] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 64,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'fixed',
            vivify: 'array',
            length: 4,
            align: 'left',
            pad: [ 0xd, 0xa ],
            fixed: true,
            bits: 64,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'fixed words')
    okay(language({ packet: {
        value: [ [ 8 ], [ Buffer ], 0x0d, 0x0a ] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 64,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'fixed',
            vivify: 'variant',
            length: 8,
            align: 'left',
            pad: [ 0xd, 0xa ],
            fixed: true,
            bits: 64,
            fields: [{
                type: 'buffer',
                dotted: '',
                vivify: 'number',
                concat: true,
                fixed: true,
                bits: 8,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'buffer concat')
    okay(language({ packet: {
        value: [ [ 8 ], [[ Buffer ]], 0x0d, 0x0a ] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 64,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'fixed',
            vivify: 'variant',
            length: 8,
            align: 'left',
            pad: [ 0xd, 0xa ],
            fixed: true,
            bits: 64,
            fields: [{
                type: 'buffer',
                concat: false,
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 8,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'buffer arrayed')
})
