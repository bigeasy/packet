require('proof')(3, okay => {
    const language = require('../../language')
    okay(language({ packet: {
        value: [ [ 16 ], 0x0, 0x0 ] }
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
            type: 'terminated',
            vivify: 'array',
            fixed: false,
            bits: 0,
            terminator: [ 0, 0 ],
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, set: 0
                }, {
                    mask: 255, size: 8, shift: 0, set: 0
                }],
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'terminated fixed')
    okay(language({ packet: {
        value: [ [ [ [ 16 ], 0x0, 0x0 ] ], 0x0, 0x0 ] }
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
            type: 'terminated',
            vivify: 'array',
            fixed: false,
            bits: 0,
            terminator: [ 0, 0 ],
            fields: [{
                type: 'terminated',
                vivify: 'array',
                dotted: '',
                fixed: false,
                bits: 0,
                terminator: [ 0, 0 ],
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    bytes: [{
                        mask: 255, size: 8, shift: 8, set: 0
                    }, {
                        mask: 255, size: 8, shift: 0, set: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'terminated nested')
    okay(language({ packet: {
        value: [ [ Buffer ], 0xd, 0xa ] }
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
            type: 'terminated',
            vivify: 'variant',
            fixed: false,
            bits: 0,
            terminator: [ 0xd, 0xa ],
            fields: [{
                type: 'buffer',
                vivify: 'number',
                dotted: '',
                concat: true,
                fixed: true,
                bits: 8,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'terminated concat')
})
