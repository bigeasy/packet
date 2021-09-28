require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({
        packet: {
            header: [{
                one: [[ 16, 'deaf' ], 1 ],
                two: -3,
                three: [ [ $_ => $_ ],  4, [ $_ => $_ ] ],
                four: 8
            }, 32 ]
        }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 32,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'object',
            fixed: true,
            endianness: 'big',
            compliment: false,
            bits: 32,
            name: 'header',
            dotted: '.header',
            bytes: [{
                mask: 255, size: 8, shift: 24, upper: 0
            }, {
                mask: 255, size: 8, shift: 16, upper: 0
            }, {
                mask: 255, size: 8, shift: 8, upper: 0
            }, {
                mask: 255, size: 8, shift: 0, upper: 0
            }],
            fields: [{
                type: 'literal',
                name: 'one',
                dotted: '.one',
                bits: 17,
                fixed: true,
                vivify: 'descend',
                before: { repeat: 1, value: 'deaf', bits: 16 },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 1,
                    endianness: 'big',
                    compliment: false
                }],
                after: { repeat: 0, value: '', bits: 0 }
            }, {
                name: 'two',
                dotted: '.two',
                type: 'integer',
                vivify: 'number',
                bits: 3,
                fixed: true,
                endianness: 'big',
                compliment: true
            }, {
                name: 'three',
                type: 'inline',
                vivify: 'descend',
                dotted: '.three',
                bits: 4,
                fixed: true,
                before: [{
                    defaulted: [],
                    positional: true,
                    properties: [],
                    source: '$_ => $_',
                    arity: 1,
                    vargs: []
                }],
                fields: [{
                    dotted: '',
                    type: 'integer',
                    vivify: 'number',
                    bytes: [{ mask: 255, size: 8, shift: -3, upper: 0 }],
                    bits: 4,
                    fixed: true,
                    endianness: 'big',
                    compliment: false
                }],
                after: [{
                    defaulted: [],
                    positional: true,
                    properties: [],
                    source: '$_ => $_',
                    arity: 1,
                    vargs: []
                }]
            }, {
                type: 'integer',
                vivify: 'number',
                dotted: '.four',
                fixed: true,
                bits: 8,
                endianness: 'big',
                compliment: false,
                name: 'four'
            }]
        }]
    }], 'packed')
})
