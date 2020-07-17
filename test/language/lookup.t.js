require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({
        packet: {
            value: [ 8, [ 'off', 'on' ] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 8,
        fields: [{
            type: 'integer',
            vivify: 'number',
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
