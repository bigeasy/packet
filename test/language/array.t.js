require('proof')(4, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 16, [ 16 ] ] } }), [{
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
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                bits: 16,
                fixed: true,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'length encoded')
    okay(simplified({ packet: { value: [ 16, [{ first: 16, second: 16 }] ] } }), [{
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
                dotted: '',
                type: 'integer',
                vivify: 'number',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                type: 'structure',
                vivify: 'object',
                dotted: '',
                bits: 32,
                fixed: true,
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    name: 'first',
                    dotted: '.first',
                    vivify: 'number',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }, {
                    type: 'integer',
                    vivify: 'number',
                    name: 'second',
                    dotted: '.second',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'length encoded fixed')
    okay(simplified({ packet: { value: [ 16, [[ 16, [ 16 ] ]] ] } }), [{
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
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                dotted: '',
                type: 'lengthEncoded',
                vivify: 'array',
                fixed: false,
                bits: 0,
                encoding: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }],
                fields: [{
                    type: 'integer',
                    vivify: 'number',
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
        vivify: 'object',
        dotted: '',
        fields: [{
            type: 'lengthEncoded',
            vivify: 'array',
            name: 'value',
            dotted: '.value',
            fixed: false,
            bits: 0,
            encoding: [{
                dotted: '',
                type: 'integer',
                vivify: 'number',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                type: 'structure',
                vivify: 'object',
                dotted: '',
                bits: 0,
                fixed: false,
                fields: [{
                    type: 'lengthEncoded',
                    vivify: 'array',
                    name: 'first',
                    dotted: '.first',
                    fixed: false,
                    bits: 0,
                    encoding: [{
                        dotted: '',
                        type: 'integer',
                        vivify: 'number',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }],
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
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
