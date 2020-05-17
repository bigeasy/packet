require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [[ 16, [ 16 ] ]] ] } }), [{
        name: 'packet',
        fixed: false,
        bits: 16,
        type: 'structure',
        dotted: '',
        lengthEncoded: true,
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'lengthEncoding',
            ethereal: true,
            fixed: true,
            bits: 16,
            endianness: 'big',
            compliment: false
        }, {
            name: 'value',
            dotted: '.value',
            type: 'lengthEncoded',
            fixed: false,
            bits: 0,
            fields: [{
                dotted: '',
                type: 'lengthEncoding',
                ethereal: true,
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }, {
                dotted: '',
                type: 'lengthEncoded',
                fixed: false,
                bits: 0,
                fields: [{
                    type: 'integer',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'length-encoded-variable')
})
