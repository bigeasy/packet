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
                ], [
                    [ 'fd', 24 ]
                ]],
                // TODO Here is the pure function, so maybe we need pure
                // functions in general.
                [ 8, [
                    sip => sip < 251, sip => sip
                ], [
                    sip => sip == 0xfc, 16
                ], [
                    24
                ]]
            ]
        }
    }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'conditional',
            vivify: 'variant',
            fixed: false,
            bits: 0,
            serialize: {
                split: true,
                conditions: [{
                    test: {
                        source: 'value => value < 251',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        source: 'value => value >= 251',
                        arity: 1
                    },
                    fields: [{
                        type: 'literal',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        before: { repeat: 1, value: 'fc', bits: 8 },
                        after: { repeat: 0, value: '' },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 16,
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'literal',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 32,
                        before: { repeat: 1, value: 'fd', bits: 8 },
                        after: { repeat: 0, value: '' },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 24,
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }]
            },
            parse: {
                sip: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    endianness: 'big',
                    compliment: false
                }],
                conditions: [{
                    test: {
                        source: 'sip => sip < 251',
                        arity: 1
                    },
                    fields: [{
                        type: 'function',
                        source: 'sip => sip',
                        arity: 1
                    }]
                }, {
                    test: {
                        source: 'sip => sip == 0xfc',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
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
                    $ => $.type == 1, 24
                ], [
                    32
                ]],
                [[
                    $ => $.type == 0, 16
                ], [
                    $ => $.type == 1, 24
                ], [
                    32
                ]]
            ]
        }
    }), [{
        dotted: '',
        fixed: false,
        bits: 8,
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'conditional',
            vivify: 'number',
            bits: 0,
            fixed: false,
            name: 'value',
            dotted: '.value',
            serialize: {
                split: true,
                conditions: [{
                    test: {
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
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
                    test: {
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
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
                $ => $.type == 1, 24
            ], [
                32
            ]]
        }
    }), [{
        dotted: '',
        fixed: false,
        bits: 8,
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'conditional',
            vivify: 'number',
            bits: 0,
            fixed: false,
            name: 'value',
            dotted: '.value',
            serialize: {
                split: false,
                conditions: [{
                    test: {
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
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
                    test: {
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
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
                ], [
                    [{
                        one: 1,
                        five: 5
                    }, 6 ]
                ]]
            }
        }
    }), [{
        dotted: '',
        fixed: true,
        bits: 8,
        type: 'structure',
        vivify: 'object',
        fields: [{
            dotted: '.header',
            fixed: true,
            bits: 8,
            type: 'structure',
            vivify: 'object',
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '.flag',
                fixed: true,
                bits: 2,
                endianness: 'big',
                compliment: false,
                name: 'flag'
            }, {
                type: 'conditional',
                vivify: 'variant',
                bits: 6,
                fixed: true,
                serialize: {
                    split: false,
                    conditions: [{
                        test: {
                            source: '$ => $.header.flag == 0',
                            arity: 1
                        },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false
                        }]
                    }, {
                        test: {
                            source: '$ => $.header.flag == 1',
                            arity: 1
                        },
                        fields: [{
                            type: 'literal',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            before: { repeat: 1, value: 'a', bits: 4 },
                            fields: [{
                                type: 'integer',
                                vivify: 'number',
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
                        test: {
                            source: '$ => $.header.flag == 2',
                            arity: 1
                        },
                        fields: [{
                            type: 'integer',
                            vivify: 'object',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false,
                            fields: [{
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.two',
                                fixed: true,
                                bits: 2,
                                endianness: 'big',
                                compliment: false,
                                name: 'two'
                            }, {
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.four',
                                fixed: true,
                                bits: 4,
                                endianness: 'big',
                                compliment: false,
                                name: 'four'
                            }]
                        }]
                    }, {
                        test: null,
                        fields: [{
                            type: 'integer',
                            vivify: 'object',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false,
                            fields: [{
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.one',
                                fixed: true,
                                bits: 1,
                                endianness: 'big',
                                compliment: false,
                                name: 'one'
                            }, {
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.five',
                                fixed: true,
                                bits: 5,
                                endianness: 'big',
                                compliment: false,
                                name: 'five'
                            }]
                        }]
                    }]
                },
                parse: {
                    sip: null,
                    conditions: [{
                        test: {
                            source: '$ => $.header.flag == 0',
                            arity: 1
                        },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false
                        }]
                    }, {
                        test: {
                            source: '$ => $.header.flag == 1',
                            arity: 1
                        },
                        fields: [{
                            type: 'literal',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            before: { repeat: 1, value: 'a', bits: 4 },
                            fields: [{
                                type: 'integer',
                                vivify: 'number',
                                dotted: '',
                                fixed: true,
                                bits: 2,
                                endianness: 'big',
                                compliment: false
                            }],
                            after: { repeat: 0, value: '' }
                        }]
                    }, {
                        test: {
                            source: '$ => $.header.flag == 2',
                            arity: 1,
                        },
                        fields: [{
                            type: 'integer',
                            vivify: 'object',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false,
                            fields: [{
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.two',
                                fixed: true,
                                bits: 2,
                                endianness: 'big',
                                compliment: false,
                                name: 'two'
                            }, {
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.four',
                                fixed: true,
                                bits: 4,
                                endianness: 'big',
                                compliment: false,
                                name: 'four'
                            }]
                        }]
                    }, {
                        test: null,
                        fields: [{
                            type: 'integer',
                            vivify: 'object',
                            dotted: '',
                            fixed: true,
                            bits: 6,
                            endianness: 'big',
                            compliment: false,
                            fields: [{
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.one',
                                fixed: true,
                                bits: 1,
                                endianness: 'big',
                                compliment: false,
                                name: 'one'
                            }, {
                                type: 'integer',
                                vivify: 'number',
                                dotted: '.five',
                                fixed: true,
                                bits: 5,
                                endianness: 'big',
                                compliment: false,
                                name: 'five'
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
