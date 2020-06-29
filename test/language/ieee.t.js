require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: { value: [ 0.64, ~64 ] } }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 64,
        fields: [{
            type: 'inline',
            vivify: 'array',
            dotted: '.value',
            bits: 64,
            fixed: true,
            ethereal: true,
            before: [{
                defaulted: [],
                properties: [],
                source: 'function (value) {\n' +
                  '    const buffer = Buffer.alloc(8)\n' +
                  '    buffer.writeDoubleLE(value)\n' +
                  '    return buffer\n' +
                  '}',
                arity: 1,
                vargs: []
            }],
            fields: [{
                type: 'fixed',
                vivify: 'array',
                length: 8,
                dotted: '',
                pad: [],
                fixed: true,
                align: 'left',
                bits: 64,
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    endianness: 'big',
                    compliment: false
                }]
            }],
            after: [{
                defaulted: [],
                properties: [],
                source: 'function (value) {\n    return Buffer.from(value).readDoubleLE()\n}',
                arity: 1,
                vargs: []
            }],
            name: 'value'
        }],
        name: 'packet'
    }], 'double little endian')
})
