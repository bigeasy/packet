require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: {
            value: [ 8, [ 'off', 'on' ] ]
        }
    }), [{
        dotted: '',
        fixed: true,
        bits: 8,
        type: 'structure',
        fields: [{
            type: 'integer',
            dotted: '.value',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'value',
            lookup: [ 'off', 'on' ]
        }],
        name: 'packet'
    }], 'lookup')
})
