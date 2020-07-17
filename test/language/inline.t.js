require('proof')(2, okay => {
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
            type: 'inline',
            vivify: 'descend',
            name: 'value',
            dotted: '.value',
            fixed: true,
            bits: 16,
            before: [{
                defaulted: [],
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
                endianness: 'big',
                compliment: false
            }],
            after: [{
                defaulted: [],
                properties: [],
                source: 'value => -value',
                arity: 1,
                vargs: []
            }]
        }]
    }], 'mirrored')
})
