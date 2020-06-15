require('proof')(4, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [ 16 ] ] } }), [{
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
                type: 'integer',
                dotted: '',
                bits: 16,
                fixed: true,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'length encoded')
    okay(simplified({ packet: { value: [ 16, [{ first: 16, second: 16 }] ] } }), [{
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
                bits: 32,
                fixed: true,
                fields: [{
                    name: 'first',
                    dotted: '.first',
                    type: 'integer',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }, {
                    name: 'second',
                    dotted: '.second',
                    type: 'integer',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'length encoded fixed')
    okay(simplified({ packet: { value: [ 16, [[ 16, [ 16 ] ]] ] } }), [{
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
    }], 'length encoded nested')
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
    }], 'length encoded variable')
})
