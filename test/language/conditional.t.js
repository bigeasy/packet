require('proof')(3, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
        packet: {
            value: [
                [[
                    value => value < 251, 8
                ], [
                    // TODO Why isn't this `[ 'fc', [ 16 ] ]`? That way we can pad
                    // anything?
                    value => value >= 251, [ 'fc', 16 ]
                ]],
                [ 8, [
                    sip => sip < 251, sip => sip
                ], [
                    sip => sip == 0xfc, 16
                ]]
            ]
        }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'conditional',
            fixed: false,
            bits: 0,
            serialize: {
                split: true,
                conditions: [{
                    source: 'value => value < 251',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    source: 'value => value >= 251',
                    arity: 1,
                    fields: [{
                        type: 'literal',
                        ethereal: true,
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        before: { repeat: 1, value: 'fc', bits: 8 },
                        after: { repeat: 0, value: '' },
                        fields: [{
                            type: 'integer',
                            dotted: '',
                            fixed: true,
                            bits: 16,
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }]
            },
            parse: {
                sip: [{
                    type: 'integer',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    endianness: 'big',
                    compliment: false
                }],
                conditions: [{
                    source: 'sip => sip < 251',
                    arity: 1,
                    fields: [{
                        type: 'function',
                        source: 'sip => sip',
                        arity: 1
                    }]
                }, {
                    source: 'sip => sip == 0xfc',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'mysql-integer')
    okay(simplified({
        packet: {
            type: 8,
            value: [
                [[
                    $ => $.type == 0, 16
                ], [
                    $ => $.type == 1, 32
                ]],
                [[
                    $ => $.type == 0, 16
                ], [
                    $ => $.type == 1, 32
                ]]
            ]
        }
    }), [{
        dotted: '',
        fixed: false,
        bits: 8,
        type: 'structure',
        name: 'packet',
        fields: [{
            type: 'integer',
            dotted: '.type',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'conditional',
            bits: 0,
            fixed: false,
            name: 'value',
            dotted: '.value',
            serialize: {
                split: true,
                conditions: [{
                    source: '$ => $.type == 0',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    source: '$ => $.type == 1',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 32,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            },
            parse: {
                sip: null,
                conditions: [{
                    source: '$ => $.type == 0',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    source: '$ => $.type == 1',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 32,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'sipless')
    okay(simplified({
        packet: {
            type: 8,
            value: [[
                $ => $.type == 0, 16
            ], [
                $ => $.type == 1, 32
            ]]
        }
    }), [{
        dotted: '',
        fixed: false,
        bits: 8,
        type: 'structure',
        name: 'packet',
        fields: [{
            type: 'integer',
            dotted: '.type',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'conditional',
            bits: 0,
            fixed: false,
            name: 'value',
            dotted: '.value',
            serialize: {
                split: false,
                conditions: [{
                    source: '$ => $.type == 0',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    source: '$ => $.type == 1',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 32,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            },
            parse: {
                sip: null,
                conditions: [{
                    source: '$ => $.type == 0',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    source: '$ => $.type == 1',
                    arity: 1,
                    fields: [{
                        type: 'integer',
                        dotted: '',
                        fixed: true,
                        bits: 32,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'bi-directional')
})
