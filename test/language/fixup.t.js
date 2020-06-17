require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: {
        value: [[ value => -value ], 16 ] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 16,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            type: 'fixup',
            vivify: 'number',
            name: 'value',
            dotted: '.value',
            fixed: true,
            ethereal: true,
            bits: 16,
            before: {
                source: 'value => -value',
                arity: 1
            },
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }],
            after: null
        }]
    }], 'serialize')
})
