require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [{ first: [ 16, [ 16 ] ] }] ] } }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        dotted: '',
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
                type: 'structure',
                dotted: '',
                bits: 0,
                fixed: false,
                fields: [{
                    name: 'first',
                    dotted: '.first',
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
        }]
    }], 'length-encoded-variable')
})
