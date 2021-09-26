require('proof')(5, okay => {
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
            calculated: false,
            fixed: true,
            bits: 64,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
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
        }]
    }], 'fixed words')
    okay(language({
        packet: {
            value: [ [ 2 ], [ [ 8, [ 8 ] ] ] ]
        }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'fixed',
            vivify: 'array',
            length: 2,
            align: 'left',
            pad: [],
            calculated: false,
            fixed: false,
            bits: 0,
            fields: [{
                type: 'lengthEncoded',
                vivify: 'array',
                encoding: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    bytes: [{
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }],
                dotted: '',
                fixed: false,
                bits: 0,
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    bytes: [{
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'nested')
    okay(language({
        packet: {
            value: [ [ 8 ], [ Buffer ], 0x0d, 0x0a ]
        }
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
            calculated: false,
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
            calculated: false,
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
    okay(language({ packet: {
        value: [ [ () => 8 ], [ 8 ] ] }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'fixed',
            vivify: 'array',
            calculated: true,
            length: {
                defaulted: [],
                positional: true,
                properties: [],
                source: '() => 8',
                arity: 0,
                vargs: []
            },
            align: 'left',
            pad: [],
            fixed: false,
            bits: 0,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 8,
                bytes: [{
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'buffer arrayed')
})
