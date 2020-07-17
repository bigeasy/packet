require('proof')(1, okay => {
    const language = require('../../language')
    okay(language({
        packet: {
            value: [ 8, [ 'off', 'on' ] ],
            yn: [ 8, [ 'no', 'yes' ] ],
            binary: [ 8, [ 'off', 'on' ] ],
            mapped: [ 8, { 0: 'off', 1: 'on' } ],
            hashed: [ 8, { 1: 'on', 0: 'off' } ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 40,
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.value',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'value',
            lookup: {
                values: [ 'off', 'on' ],
                index: 0
            }
        }, {
            type: 'integer',
            vivify: 'number',
            dotted: '.yn',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'yn',
            lookup: {
                values: [ 'no', 'yes' ],
                index: 1
            }
        }, {
            type: 'integer',
            vivify: 'number',
            dotted: '.binary',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'binary',
            lookup: {
                values: [ 'off', 'on' ],
                index: 0
            }
        }, {
            type: 'integer',
            vivify: 'number',
            dotted: '.mapped',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'mapped',
            lookup: {
                values: {  0: 'off', 1: 'on' },
                index: 2
            }
        }, {
            type: 'integer',
            vivify: 'number',
            dotted: '.hashed',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'hashed',
            lookup: {
                values: {  0: 'off', 1: 'on' },
                index: 2
            }
        }],
        name: 'packet'
    }], 'lookup')
})
