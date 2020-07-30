require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({
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
            bytes: [{
                mask: 255, size: 8, shift: 24, set: 0
            }, {
                mask: 255, size: 8, shift: 16, set: 0
            }, {
                mask: 255, size: 8, shift: 8, set: 0
            }, {
                mask: 255, size: 8, shift: 0, set: 0
            }],
            fields: [{
                type: 'literal',
                name: 'one',
                dotted: '.one',
                bits: 17,
                fixed: true,
                vivify: 'descend',
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
