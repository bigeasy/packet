require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({ packet: {
        value: [ [ 16 ], 0x0, 0x0 ] }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        arrayed: true,
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'terminated',
            fixed: false,
            bits: 0,
            terminator: [ 0, 0 ],
            fields: [{
                type: 'integer',
                fixed: true,
                bits: 16,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'length-encoded-fixed')
})
