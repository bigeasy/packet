require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [{ first: 16, second: 16 }] ] } }), [{
        name: 'packet',
        fixed: false,
        bits: 16,
        type: 'structure',
        lengthEncoded: true,
        fields: [{
            name: 'value',
            type: 'lengthEncoding',
            fixed: true,
            bits: 16,
            length: {
                type: 'integer',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }
        }, {
            name: 'value',
            type: 'lengthEncoded',
            fixed: false,
            bits: 0,
            element: {
                type: 'structure',
                bits: 32,
                fixed: true,
                fields: [{
                    name: 'first',
                    type: 'integer',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }, {
                    name: 'second',
                    type: 'integer',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }]
            }
        }]
    }], 'length-encoded-fixed')
})
