require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: {
            header: [{
                one: [[ 16, 'deaf' ], 1 ],
                two: -3,
                three: 12
            }, 32 ]
        }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 32,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            type: 'integer',
            vivify: 'object',
            fixed: true,
            endianness: 'big',
            compliment: false,
            bits: 32,
            name: 'header',
            dotted: '.header',
            fields: [{
                type: 'literal',
                name: 'one',
                dotted: '.one',
                bits: 17,
                fixed: true,
                vivify: 'number',
                before: { repeat: 1, value: 'deaf', bits: 16 },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 1,
                    endianness: 'big',
                    compliment: false
                }],
                after: { repeat: 0, value: '', bits: 0 }
            }, {
                name: 'two',
                dotted: '.two',
                type: 'integer',
                vivify: 'number',
                bits: 3,
                fixed: true,
                endianness: 'big',
                compliment: true
            }, {
                name: 'three',
                dotted: '.three',
                type: 'integer',
                vivify: 'number',
                bits: 12,
                fixed: true,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'packed')
})
