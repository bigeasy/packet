require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({
        $value: [ 16, [ 16 ] ],
        packet: {
            value: '$value'
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: false,
        bits: 0,
        dotted: '',
        fields: [{
            type: 'lengthEncoded',
            vivify: 'array',
            name: 'value',
            dotted: '.value',
            fixed: false,
            bits: 0,
            encoding: [{
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
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                fixed: true,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'include')
})
