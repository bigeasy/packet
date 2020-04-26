require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: {
            value: [[[
                value => value < 251, 8
            ], [
                value => value >= 251, [ 'fc', 16 ]
            ]], [ 8, [
                sip => sip < 251, sip => sip
            ], [
                sip => sip == 0xfc, 16
            ]]]
        }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'conditional',
            fixed: false,
            bits: 0,
            serialize: {
                conditions: [{
                    source: 'value => value < 251',
                    airty: 1,
                    fields: [{
                        type: 'integer',
                        fixed: true,
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    source: 'value => value >= 251',
                    airty: 1,
                    fields: [{
                        type: 'literal',
                        fixed: true,
                        bits: 8,
                        value: 'fc'
                    }, {
                        type: 'integer',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            },
            parse: {
                sip: [{
                    type: 'integer',
                    fixed: true,
                    bits: 8,
                    endianness: 'big',
                    compliment: false
                }],
                conditions: [{
                    source: 'sip => sip < 251',
                    airty: 1,
                    fields: [{
                        type: 'function',
                        source: 'sip => sip',
                        airty: 1
                    }]
                }, {
                    source: 'sip => sip == 0xfc',
                    airty: 1,
                    fields: [{
                        type: 'integer',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'mysql-integer')
})
