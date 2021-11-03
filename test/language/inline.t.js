require('proof')(3, okay => {
    const language = require('../../language')
    okay(language({ packet: {
        value: [[ value => -value ], 16 , []] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 16,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            type: 'inline',
            vivify: 'descend',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            before: [{
                defaulted: [],
                positional: true,
                properties: [],
                source: 'value => -value',
                arity: 1,
                vargs: []
            }],
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
            }],
            after: []
        }]
    }], 'serialize')
    okay(language({ packet: {
        value: [[[ value => -value ]], 16 ] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 16,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            // **TODO** The name ought to be part of the field definition.
            type: 'inline',
            vivify: 'descend',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            before: [{
                defaulted: [],
                positional: true,
                properties: [],
                source: 'value => -value',
                arity: 1,
                vargs: []
            }],
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
            }],
            after: [{
                defaulted: [],
                positional: true,
                properties: [],
                source: 'value => -value',
                arity: 1,
                vargs: []
            }]
        }]
    }], 'mirrored')
    okay(language({ packet: {
        _elided: [[[ $_ => $_ ]], { first: 16 } ] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 16,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            // **TODO** The name ought to be part of the field definition.
            type: 'inline',
            vivify: 'descend',
            dotted: '',
            fixed: true,
            bits: 16,
            name: '_elided',
            before: [{
                defaulted: [],
                positional: true,
                properties: [],
                source: '$_ => $_',
                arity: 1,
                vargs: []
            }],
            fields: [{
                type: 'structure',
                vivify: 'object',
                dotted: '',
                fixed: true,
                bits: 16,
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    name: 'first',
                    dotted: '.first',
                    fixed: true,
                    bits: 16,
                    bytes: [{
                        mask: 255, size: 8, shift: 8, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }],
            }],
            after: [{
                defaulted: [],
                positional: true,
                properties: [],
                source: '$_ => $_',
                arity: 1,
                vargs: []
            }]
        }]
    }], 'elided')
})
