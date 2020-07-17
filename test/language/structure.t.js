require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({
        object: {
            value: {
                first: 8,
                second: 8
            }
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 16,
        fields: [{
            type: 'structure',
            vivify: 'object',
            dotted: '.value',
            fixed: true,
            bits: 16,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '.first',
                fixed: true,
                bits: 8,
                endianness: 'big',
                compliment: false,
                name: 'first'
            }, {
                type: 'integer',
                vivify: 'number',
                dotted: '.second',
                fixed: true,
                bits: 8,
                endianness: 'big',
                compliment: false,
                name: 'second'
            }],
            name: 'value'
        }],
        name: 'object'
    }], 'structure')
})
