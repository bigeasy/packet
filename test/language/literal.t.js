require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ '0faded', 16, 'facade' ] } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 64,
        dotted: '',
        fields: [{
            type: 'literal',
            vivify: 'number',
            dotted: '',
            fixed: true,
            name: 'value',
            dotted: '.value',
            before: {
                value: '0faded',
                repeat: 1,
                bits: 24
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
            after: {
                value: 'facade',
                repeat: 1,
                bits: 24
            },
            bits: 64
        }]
    }], 'literal')
})
