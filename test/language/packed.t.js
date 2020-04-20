require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: {
            header: {
                literal: 'deaf',
                one: 1,
                two: 3,
                three: 12
            }
        }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 32,
        type: 'structure',
        fields: [{
            type: 'integer',
            fixed: true,
            bits: 32,
            name: 'header',
            dotted: '.header',
            fields: [{
                type: 'literal',
                bits: 16,
                fixed: true
            }, {
                name: 'one',
                dotted: '.one',
                type: 'integer',
                fixed: true,
                bits: 1,
                endianness: 'big',
                compliment: false
            }, {
                name: 'two',
                dotted: '.two',
                type: 'integer',
                bits: 3,
                fixed: true,
                endianness: 'big',
                compliment: false
            }, {
                name: 'three',
                dotted: '.three',
                type: 'integer',
                bits: 12,
                fixed: true,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'literal')
})
