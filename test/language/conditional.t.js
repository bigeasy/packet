require('proof')(4, okay => {
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
    okay(simplified({
        packet: {
            header: {
                flag: 2,
                body: [[
                    $ => $.header.flag == 0, 6
                ], [
                    $ => $.header.flag == 1, [ 'a', 2 ]
                ], [
                    $ => $.header.flag == 2, [{
                        two: 2,
                        four: 4
                    }, 6 ]
                ]]
            }
        }
    }), [{
        dotted: '',
        fixed: true,
        bits: 8,
        type: 'structure',
        fields: [{
            dotted: '.header',
            fixed: true,
            bits: 8,
            type: 'structure',
            fields: [{
                type: 'integer',
                dotted: '.flag',
                fixed: true,
                bits: 2,
                endianness: 'big',
                compliment: false,
                name: 'flag'
            }, {
                type: 'conditional',
                bits: 6,
                fixed: true,
                serialize: {
                    split: false,
                    conditions: [{
                        source: '$ => $.header.flag == 0',
                        arity: 1,
                        fields: [{
                            type: 'integer',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false
                        }]
                    }, {
                        source: '$ => $.header.flag == 1',
                        arity: 1,
                        fields: [{
                            type: 'literal',
                            dotted: '',
                            ethereal: true,
                            fixed: true,
                            bits: 6,
                            before: { repeat: 1, value: 'a', bits: 4 },
                            fields: [{
                                type: 'integer',
                                dotted: '',
                                fixed: true,
                                bits: 2,
                                endianness: 'big',
                                compliment: false
                              }
                            ],
                            after: { repeat: 0, value: '' }
                        }]
                    }, {
                        source: '$ => $.header.flag == 2',
                        arity: 1,
                        fields: [{
                            type: 'integer',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false,
                            fields: [{
                                type: 'integer',
                                dotted: '.two',
                                fixed: true,
                                bits: 2,
                                endianness: 'big',
                                compliment: false,
                                name: 'two'
                            }, {
                                type: 'integer',
                                dotted: '.four',
                                fixed: true,
                                bits: 4,
                                endianness: 'big',
                                compliment: false,
                                name: 'four'
                            }]
                        }]
                    }]
                },
                parse: {
                    sip: null,
                    conditions: [{
                        source: '$ => $.header.flag == 0',
                        arity: 1,
                        fields: [{
                            type: 'integer',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false
                        }]
                    }, {
                        source: '$ => $.header.flag == 1',
                        arity: 1,
                        fields: [{
                            type: 'literal',
                            dotted: '',
                            ethereal: true,
                            fixed: true,
                            bits: 6,
                            before: { repeat: 1, value: 'a', bits: 4 },
                            fields: [{
                                type: 'integer',
                                dotted: '',
                                fixed: true,
                                bits: 2,
                                endianness: 'big',
                                compliment: false
                            }],
                            after: { repeat: 0, value: '' }
                        }]
                    }, {
                      source: '$ => $.header.flag == 2',
                      arity: 1,
                      fields: [{
                          type: 'integer',
                          dotted: '',
                          fixed: true,
                          bits: 6,
                          endianness: 'big',
                          compliment: false,
                          fields: [{
                              type: 'integer',
                              dotted: '.two',
                              fixed: true,
                              bits: 2,
                              endianness: 'big',
                              compliment: false,
                              name: 'two'
                          }, {
                              type: 'integer',
                              dotted: '.four',
                              fixed: true,
                              bits: 4,
                              endianness: 'big',
                              compliment: false,
                              name: 'four'
                          }]
                      }]
                  }]
                },
                name: 'body',
                dotted: '.body'
            }],
            name: 'header'
        }],
        name: 'packet'
    }], 'packed')
})
