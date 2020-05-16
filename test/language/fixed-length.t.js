require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: {
        value: [ 0xaa, 0xaa, [ 4 ], [ 16 ] ] }
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
            type: 'array',
            length: 4,
            align: 'left',
            pad: [ 0xaa, 0xaa ],
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
