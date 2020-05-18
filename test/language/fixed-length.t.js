require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: {
        value: [ [ 4 ], [ 16 ], 0x0d, 0x0a ] }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 64,
        type: 'structure',
        dotted: '',
        arrayed: true,
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'fixed',
            length: 4,
            align: 'left',
            pad: [ 0xd, 0xa ],
            fixed: true,
            bits: 64,
            fields: [{
                type: 'integer',
                dotted: '',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'fixed-words')
})
