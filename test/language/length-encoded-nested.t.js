require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [[ 16, [ 16 ] ]] ] } }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        dotted: '',
        lengthEncoded: true,
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'lengthEncoded',
            fixed: false,
            bits: 0,
            encoding: [{
                dotted: '',
                type: 'integer',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                dotted: '',
                type: 'lengthEncoded',
                fixed: false,
                bits: 0,
                encoding: [{
                    dotted: '',
                    type: 'integer',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }],
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
