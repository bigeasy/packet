require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [[ '0faded', 2 ], 16, [ 'facade', 2 ]] } }), [{
        name: 'packet',
        fixed: true,
        bits: 112,
        type: 'structure',
        dotted: '',
        fields: [{
            type: 'literal',
            ethereal: true,
            dotted: '',
            fixed: true,
            before: {
                value: '0faded',
                repeat: 2,
                bits: 24
            },
            fields: [{
                name: 'value',
                dotted: '.value',
                type: 'integer',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }],
            after: {
                value: 'facade',
                repeat: 2,
                bits: 24
            },
            bits: 112
        }]
    }], 'literal')
})
