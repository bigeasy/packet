require('proof')(1, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: {
            value: [[[
                value => value < 251, 8
            ], [
                value => value >= 251, [ 'fc', 16 ]
            ]], [ 8, [[
                sip => sip < 251, sip => sip
            ], [
                sip => sip == 0xfc, 16
            ]]]]
        }
    }), [{
        name: 'packet',
        fixed: true, // wrong
        bits: 0,
        type: 'structure',
        fields: [{
            name: 'value',
            type: 'conditional',
            fixed: false,
            bits: 0,
            serialize: {
                conditions: [{
                    test: 'value => value < 251',
                    fields: [{
                        type: 'integer',
                        fixed: true,
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: 'value => value >= 251',
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
                    test: 'sip => sip < 251',
                    fields: [{
                        type: 'function',
                        source: 'sip => sip'
                    }]
                }, {
                    test: 'sip => sip == 0xfc',
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
