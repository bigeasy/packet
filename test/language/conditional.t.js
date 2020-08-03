require('proof')(5, okay => {
    const language = require('../../language')
    okay(language({
        packet: {
            value: [
                [
                    value => value < 251, 8,
                    value => value >= 251, [ 'fc', 16 ],
                    true, [ 'fd', 24 ]
                ],
                [ 8,
                    sip => sip < 251, 8,
                    sip => sip == 0xfc, [ 'fc', 16 ],
                    true, [ 'fd', 24 ]
                ]
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
            vivify: 'number',
            fixed: false,
            bits: 0,
            split: true,
            serialize: {
                conditions: [{
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: 'value => value < 251',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 8,
                        bytes: [{ upper: 0, mask: 255, shift: 0, size: 8 }],
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: 'value => value >= 251',
                        arity: 1
                    },
                    fields: [{
                        type: 'literal',
                        vivify: 'descend',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        before: { repeat: 1, value: 'fc', bits: 8 },
                        after: { repeat: 0, value: '', bits: 0 },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 16,
                            bytes: [{
                                upper: 0, mask: 255, shift: 8, size: 8
                            }, {
                                upper: 0, mask: 255, shift: 0, size: 8
                            }],
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'literal',
                        vivify: 'descend',
                        dotted: '',
                        fixed: true,
                        bits: 32,
                        before: { repeat: 1, value: 'fd', bits: 8 },
                        after: { repeat: 0, value: '', bits: 0 },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 24,
                            bytes: [{
                                upper: 0, mask: 255, shift: 16, size: 8
                            }, {
                                upper: 0, mask: 255, shift: 8, size: 8
                            }, {
                                upper: 0, mask: 255, shift: 0, size: 8
                            }],
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }]
            },
            parse: {
                type: 'parse',
                vivify: 'number',
                sip: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    bytes: [{
                        upper: 0, mask: 255, shift: 0, size: 8
                    }],
                    endianness: 'big',
                    compliment: false
                }],
                conditions: [{
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: 'sip => sip < 251',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bytes: [{
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: 'sip => sip == 0xfc',
                        arity: 1
                    },
                    fields: [{
                        type: 'literal',
                        dotted: '',
                        vivify: 'descend',
                        fixed: true,
                        bits: 24,
                        before: { repeat: 1, value: 'fc', bits: 8 },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 16,
                            bytes: [{
                                upper: 0, mask: 255, shift: 8, size: 8
                            }, {
                                upper: 0, mask: 255, shift: 0, size: 8
                            }],
                            endianness: 'big',
                            compliment: false
                        }],
                        after: { repeat: 0, value: '', bits: 0 }
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'literal',
                        dotted: '',
                        vivify: 'descend',
                        fixed: true,
                        bits: 32,
                        before: { repeat: 1, value: 'fd', bits: 8 },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 24,
                            bytes: [{
                                upper: 0, mask: 255, shift: 16, size: 8
                            }, {
                                upper: 0, mask: 255, shift: 8, size: 8
                            }, {
                                upper: 0, mask: 255, shift: 0, size: 8
                            }],
                            endianness: 'big',
                            compliment: false
                        }],
                        after: { repeat: 0, value: '', bits: 0 }
                    }]
                }]
            }
        }]
    }], 'mysql-integer')
    okay(language({
        packet: {
            type: 8,
            value: [
                [
                    $ => $.type == 0, 16,
                    $ => $.type == 1, 24,
                    true, 32
                ], [
                    $ => $.type == 0, 16,
                    $ => $.type == 1, 24,
                    true, 32
                ]
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
            bytes: [{
                upper: 0, mask: 255, shift: 0, size: 8
            }],
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
            split: true,
            serialize: {
                conditions: [{
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        bytes: [{
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        bytes: [{
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
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
                        bytes: [{
                            upper: 0, mask: 255, shift: 24, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            },
            parse: {
                sip: null,
                type: 'parse',
                vivify: 'number',
                conditions: [{
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        bytes: [{
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        bytes: [{
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
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
                        bytes: [{
                            upper: 0, mask: 255, shift: 24, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'sipless')
    okay(language({
        packet: {
            type: 8,
            value: [
                $ => $.type == 0, 16,
                $ => $.type == 1, 24,
                true, 32
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
            bytes: [{
                upper: 0, mask: 255, shift: 0, size: 8
            }],
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
            split: false,
            serialize: {
                conditions: [{
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        bytes: [{
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        bytes: [{
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
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
                        bytes: [{
                            upper: 0, mask: 255, shift: 24, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            },
            parse: {
                sip: null,
                conditions: [{
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 0',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        bytes: [{
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }, {
                    test: {
                        defaulted: [],
                        properties: [],
                        vargs: [],
                        source: '$ => $.type == 1',
                        arity: 1
                    },
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 24,
                        bytes: [{
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
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
                        bytes: [{
                            upper: 0, mask: 255, shift: 24, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 16, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 8, size: 8
                        }, {
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'bi-directional')
    okay(language({
        packet: {
            header: [{
                flag: 2,
                body: [
                    $ => $.header.flag == 0, 6,
                    $ => $.header.flag == 1, [ 'a', 2 ],
                    $ => $.header.flag == 2, [{
                        two: 2,
                        four: 4
                    }, 6 ],
                    true, [{
                        one: 1,
                        five: 5
                    }, 6 ]
                ]
            }, 8 ]
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
            bytes: [{
                upper: 0, mask: 255, shift: 0, size: 8
            }],
            type: 'integer',
            endianness: 'big',
            compliment: false,
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
                split: false,
                serialize: {
                    conditions: [{
                        test: {
                            defaulted: [],
                            properties: [],
                            vargs: [],
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
                            defaulted: [],
                            properties: [],
                            vargs: [],
                            source: '$ => $.header.flag == 1',
                            arity: 1
                        },
                        fields: [{
                            type: 'literal',
                            vivify: 'descend',
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
                            after: { repeat: 0, value: '', bits: 0 }
                        }]
                    }, {
                        test: {
                            defaulted: [],
                            properties: [],
                            vargs: [],
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
                            defaulted: [],
                            properties: [],
                            vargs: [],
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
                            defaulted: [],
                            properties: [],
                            vargs: [],
                            source: '$ => $.header.flag == 1',
                            arity: 1
                        },
                        fields: [{
                            type: 'literal',
                            vivify: 'descend',
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
                            after: { repeat: 0, value: '', bits: 0 }
                        }]
                    }, {
                        test: {
                            defaulted: [],
                            properties: [],
                            vargs: [],
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
                name: 'body',
                dotted: '.body'
            }],
            name: 'header'
        }],
        name: 'packet'
    }], 'packed')
    okay(language({
        object: {
            value: [
                [
                    value => value <= 0x7f, 8,
                    value => value <= 0x3fff, [ 16, 0x80, 7, 0x0, 7 ],
                    value => value <= 0x1fffff, [ 24, 0x80, 7, 0x80, 7, 0x0, 7 ],
                    true, [ 32, 0x80, 7, 0x80, 7, 0x80, 7, 0x0, 7 ]
                ],
                [ 8,
                    sip => sip & 0x80 == 0, 8,
                    true, [ 8,
                        sip => sip & 0x80 == 0, [ 16, 0x80, 7, 0x0, 7 ],
                        true, [ 8,
                            sip => sip & 0x80 == 0, [ 24, 0x80, 7, 0x80, 7, 0x0, 7 ],
                            // TODO Maybe we always mask since we mask anyway?
                            true, [ 32, 0x80, 7, 0x80, 7, 0x80, 7, 0x0, 7 ]
                        ]
                    ]
                ]
            ]
        }
    }), [{
    type: 'structure',
    vivify: 'object',
    dotted: '',
    fixed: false,
    bits: 0,
    fields: [{
        type: 'conditional',
        vivify: 'number',
        bits: 0,
        fixed: false,
        split: true,
        serialize: {
            conditions: [{
                test: {
                    defaulted: [],
                    properties: [],
                    source: 'value => value <= 0x7f',
                    arity: 1,
                    vargs: []
                },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    bytes: [{
                        upper: 0, mask: 255, shift: 0, size: 8
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }, {
                test: {
                    defaulted: [],
                    properties: [],
                    source: 'value => value <= 0x3fff',
                    arity: 1,
                    vargs: []
                },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    bytes: [{
                        upper: 128, mask: 127, shift: 7, size: 7
                    }, {
                        upper: 0, mask: 127, shift: 0, size: 7
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }, {
                test: {
                    defaulted: [],
                    properties: [],
                    source: 'value => value <= 0x1fffff',
                    arity: 1,
                    vargs: []
                },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 24,
                    bytes: [{
                        upper: 128, mask: 127, shift: 14, size: 7
                    }, {
                        upper: 128, mask: 127, shift: 7, size: 7
                    }, {
                        upper: 0, mask: 127, shift: 0, size: 7
                    }],
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
                    bytes: [{
                        upper: 128, mask: 127, shift: 21, size: 7
                    }, {
                        upper: 128, mask: 127, shift: 14, size: 7
                    }, {
                        upper: 128, mask: 127, shift: 7, size: 7
                    }, {
                        upper: 0, mask: 127, shift: 0, size: 7
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }]
        },
        parse: {
            type: 'parse',
            sip: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 8,
                bytes: [{
                    upper: 0, mask: 255, shift: 0, size: 8
                }],
                endianness: 'big',
                compliment: false
            }],
            vivify: 'number',
            conditions: [{
                test: {
                    defaulted: [],
                    properties: [],
                    source: 'sip => sip & 0x80 == 0',
                    arity: 1,
                    vargs: []
                },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    bytes: [{
                        upper: 0, mask: 255, shift: 0, size: 8
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }, {
                test: null,
                fields: [{
                    type: 'parse',
                    sip: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 8,
                        bytes: [{
                            upper: 0, mask: 255, shift: 0, size: 8
                        }],
                        endianness: 'big',
                        compliment: false
                    }],
                    vivify: 'number',
                    conditions: [{
                        test: {
                            defaulted: [],
                            properties: [],
                            source: 'sip => sip & 0x80 == 0',
                            arity: 1,
                            vargs: []
                        },
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bits: 16,
                            bytes: [{
                                upper: 128, mask: 127, shift: 7, size: 7
                            }, {
                                upper: 0, mask: 127, shift: 0, size: 7
                            }],
                            endianness: 'big',
                            compliment: false
                        }]
                    }, {
                        test: null,
                        fields: [{
                            type: 'parse',
                            sip: [{
                                type: 'integer',
                                vivify: 'number',
                                dotted: '',
                                fixed: true,
                                bits: 8,
                                bytes: [{
                                    upper: 0, mask: 255, shift: 0, size: 8
                                }],
                                endianness: 'big',
                                compliment: false
                            }],
                            vivify: 'number',
                            conditions: [{
                                test: {
                                    defaulted: [],
                                    properties: [],
                                    source: 'sip => sip & 0x80 == 0',
                                    arity: 1,
                                    vargs: []
                                },
                                fields: [{
                                    type: 'integer',
                                    vivify: 'number',
                                    dotted: '',
                                    fixed: true,
                                    bits: 24,
                                    bytes: [{
                                        upper: 128, mask: 127, shift: 14, size: 7
                                    }, {
                                        upper: 128, mask: 127, shift: 7, size: 7
                                    }, {
                                        upper: 0, mask: 127, shift: 0, size: 7
                                    }],
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
                                    bytes: [{
                                        upper: 128, mask: 127, shift: 21, size: 7
                                    }, {
                                        upper: 128, mask: 127, shift: 14, size: 7
                                    }, {
                                        upper: 128, mask: 127, shift: 7, size: 7
                                    }, {
                                        upper: 0, mask: 127, shift: 0, size: 7
                                    }],
                                    endianness: 'big',
                                    compliment: false
                                  }]
                              }
                          ]}
                      ]}
                  ]}
              ]}
              ]
        },
        name: 'value',
        dotted: '.value'
    }],
    name: 'object'
}], 'nested sip')
})
