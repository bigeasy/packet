require('proof')(1, okay => {
    const simplified = require('../../simplified')
    // TODO Come back and complete when you've implemented nested structures.
    okay(simplified({
        packet: {
            type: 8,
            value: [ $ => $.type, {
                0: 8,
                1: 16
            }, 32 ]
        }
    }), [{
        dotted: '',
        fixed: false,
        bits: 8,
        type: 'structure',
        fields: [{
            type: 'integer',
            dotted: '.type',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'switch',
            source: '$ => $.type',
            bits: 0,
            fixed: false,
            cases: [{
                value: '0',
                fields: [
                  {
                    type: 'integer',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    endianness: 'big',
                    compliment: false
                  }
                ]
            }, {
                value: '1',
                fields: [{
                    type: 'integer',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    endianness: 'big',
                    compliment: false
                }]
            }],
            otherwise: [{
                type: 'integer',
                dotted: '',
                fixed: true,
                bits: 32,
                endianness: 'big',
                compliment: false
            }],
            name: 'value',
            dotted: '.value'
        }],
        name: 'packet'
    }], 'switch')
})
