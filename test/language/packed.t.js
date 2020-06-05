require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: {
            header: [{
                one: [ 'deaf', 1 ],
                two: -3,
                three: 12
            }, 32 ]
        }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 32,
        type: 'structure',
        dotted: '',
        fields: [{
            type: 'integer',
            fixed: true,
            endianness: 'big',
            compliment: false,
            bits: 32,
            name: 'header',
            dotted: '.header',
            fields: [{
                type: 'literal',
                bits: 17,
                dotted: '',
                fixed: true,
                ethereal: true,
                before: { repeat: 1, value: 'deaf', bits: 16 },
                fields: [{
                    name: 'one',
                    dotted: '.one',
                    type: 'integer',
                    fixed: true,
                    bits: 1,
                    endianness: 'big',
                    compliment: false
                }],
                after: { repeat: 0, value: '' }
            }, {
                name: 'two',
                dotted: '.two',
                type: 'integer',
                bits: 3,
                fixed: true,
                endianness: 'big',
                compliment: true
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
    }], 'packed')
})
