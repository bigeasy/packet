require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({ packet: { value: [ 0.64, ~64 ] } }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 64,
        fields: [{
            type: 'inline',
            vivify: 'descend',
            dotted: '.value',
            bits: 64,
            fixed: true,
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
                vivify: 'variant',
                length: 8,
                dotted: '',
                pad: [],
                fixed: true,
                align: 'left',
                calculated: false,
                bits: 64,
                fields: [{
                    type: 'buffer',
                    vivify: 'number',
                    dotted: '',
                    concat: true,
                    fixed: true,
                    bits: 8,
                    endianness: 'big',
                    compliment: false
                }]
            }],
            after: [{
                defaulted: [],
                properties: [],
                source: 'function (value) {\n    return value.readDoubleLE()\n}',
                arity: 1,
                vargs: []
            }],
            name: 'value'
        }],
        name: 'packet'
    }], 'double little endian')
})
