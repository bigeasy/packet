require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [{ first: [ 16, [ 16 ] ] }] ] } }), [{
        name: 'packet',
        fixed: false,
        bits: 16,
        type: 'structure',
        lengthEncoded: true,
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'lengthEncoding',
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
            element: {
                type: 'structure',
                bits: 16,
                fixed: false,
                fields: [{
                    name: 'first',
                    dotted: '.first',
                    type: 'lengthEncoding',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }, {
                    name: 'first',
                    dotted: '.first',
                    type: 'lengthEncoded',
                    fixed: false,
                    bits: 0,
                    element: {
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }
                }]
            }
        }]
    }], 'length-encoded-variable')
})
