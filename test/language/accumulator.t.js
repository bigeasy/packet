require('proof')(3, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: [{
            counter: [ 0 ]
        }, {
            value: 32
        }]
    }), [{
        type: 'accumulator',
        accumulators: [ { type: 'object', name: 'counter', value: [ 0 ] } ],
        fields: [{
            type: 'structure',
            vivify: 'object',
            dotted: '',
            fixed: true,
            bits: 32,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '.value',
                fixed: true,
                bits: 32,
                endianness: 'big',
                compliment: false,
                name: 'value'
            }]
        }],
        name: 'packet'
    }], 'literal accumulator')
    okay(simplified({
        packet: [{
            regex: /^\//g
        }, {
            value: 32
        }]
    }), [{
        type: 'accumulator',
        accumulators: [{ type: 'regex', name: 'regex', source: '/^\\//g' }],
        fields: [{
            type: 'structure',
            vivify: 'object',
            dotted: '',
            fixed: true,
            bits: 32,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '.value',
                fixed: true,
                bits: 32,
                endianness: 'big',
                compliment: false,
                name: 'value'
            }]
        }],
        name: 'packet'
    }], 'regex accumulator')
    okay(simplified({
        packet: [{
            f: () => {}
        }, {
            value: 32
        }]
    }), [{
        type: 'accumulator',
        accumulators: [{
            type: 'function',
            name: 'f',
            defaulted: [],
            properties: [],
            source: '() => {}',
            arity: 0,
            vargs: []
        }],
        fields: [{
            type: 'structure',
            vivify: 'object',
            dotted: '',
            fixed: true,
            bits: 32,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '.value',
                fixed: true,
                bits: 32,
                endianness: 'big',
                compliment: false,
                name: 'value'
            }]
        }],
        name: 'packet'
    }], 'function accumulator')
})
