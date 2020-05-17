require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ '0faded', 16, 'facade' ] } }), [{
        name: 'packet',
        fixed: true,
        bits: 64,
        type: 'structure',
        dotted: '',
        fields: [{
            type: 'literal',
            ethereal: true,
            name: '',
            dotted: '',
            fixed: true,
            before: {
                value: '0faded',
                repeat: 1
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
                repeat: 1
            },
            bits: 64
        }]
    }], 'literal')
})
