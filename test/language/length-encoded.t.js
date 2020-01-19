require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [ 16 ] ] } }), [{
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
            endianness: 'big',
            compliment: false
        }, {
            name: 'value',
            type: 'lengthEncoded',
            fixed: false,
            bits: 0,
            element: {
                type: 'integer',
                bits: 16,
                fixed: true,
                endianness: 'big',
                compliment: false
            }
        }]
    }], 'length-encoded')
})
