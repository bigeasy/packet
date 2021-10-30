require('proof')(8, okay => {
    const language = require('../../language')
    okay(language({
        packet: {
            value: [
                [ true, [ [ $ => $.body.length ], [ 8 ] ] ],
                [ true, [ [ $ => $.header.length - 8 ], [ 8 ] ] ]
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
            vivify: 'array',
            fixed: false,
            bits: 0,
            split: true,
            serialize: {
                unconditional: true,
                conditions: [{
                    test: null,
                    fields: [{
                        type: 'fixed',
                        vivify: 'array',
                        dotted: '',
                        pad: [],
                        calculated: true,
                        fixed: false,
                        length: {
                            defaulted: [],
                            positional: true,
                            properties: [],
                            source: '$ => $.body.length',
                            arity: 1,
                            vargs: []
                        },
                        bits: 0,
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                            bits: 8,
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }]
            },
            parse: {
                vivify: 'array',
                sip: null,
                unconditional: true,
                conditions: [{
                    test: null,
                    fields: [{
                        type: 'fixed',
                        vivify: 'array',
                        dotted: '',
                        pad: [],
                        calculated: true,
                        fixed: false,
                        length: {
                            defaulted: [],
                            positional: true,
                            properties: [],
                            source: '$ => $.header.length - 8',
                            arity: 1,
                            vargs: []
                        },
                        bits: 0,
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                            bits: 8,
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }]
            }
        }]
    }], 'unconditional split')
    okay(language({
        packet: {
            value: [ true, 8 ]
        }
    }), [{
        name: 'packet',
        fixed: true,
        bits: 8,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            name: 'value',
            dotted: '.value',
            type: 'conditional',
            vivify: 'number',
            fixed: true,
            bits: 8,
            split: false,
            serialize: {
                unconditional: true,
                conditions: [{
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            },
            parse: {
                sip: null,
                unconditional: true,
                conditions: [{
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'unconditional mirrored')
    okay(language({
        packet: {
            value: [[
                value => value & 0x80, [ [ 2 ], [ 8 ] ],
                true, 16
            ], [
                value => value & 0x80, [ [ 2 ], [ 8 ] ],
                true, [ 8, true, 16 ]
            ]]
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
            split: true,
            serialize: {
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
                        properties: [],
                        source: 'value => value & 0x80',
                        arity: 1,
                        vargs: []
                    },
                    fields: [{
                        type: 'fixed',
                        vivify: 'array',
                        dotted: '',
                        pad: [],
                        calculated: false,
                        fixed: true,
                        length: 2,
                        bits: 16,
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                            bits: 8,
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bytes: [{
                            mask: 255, size: 8, shift: 8, upper: 0
                        }, {
                            mask: 255, size: 8, shift: 0, upper: 0
                        }],
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            },
            parse: {
                vivify: 'variant',
                sip: null,
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
                        properties: [],
                        source: 'value => value & 0x80',
                        arity: 1,
                        vargs: []
                    },
                    fields: [{
                        type: 'fixed',
                        vivify: 'array',
                        dotted: '',
                        pad: [],
                        calculated: false,
                        fixed: true,
                        length: 2,
                        bits: 16,
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                            bits: 8,
                            endianness: 'big',
                            compliment: false
                        }]
                    }]
                }, {
                    test: null,
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bytes: [{
                            mask: 255, size: 8, shift: 8, upper: 0
                        }, {
                            mask: 255, size: 8, shift: 0, upper: 0
                        }],
                        bits: 16,
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }
        }]
    }], 'unconditional sip')
    okay(language({
        packet: {
            value: [
                [
                    value => value < 251, 8,
                    value => value >= 251, [[ 'fc' ], 16 ],
                    true, [[ 'fd' ], 24 ]
                ],
                [ 8,
                    sip => sip < 251, 8,
                    sip => sip == 0xfc, [[ 'fc' ], 16 ],
                    true, [[ 'fd' ], 24 ]
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
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
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
                        positional: true,
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
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
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
                        positional: true,
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
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
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
                        positional: true,
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
                vivify: 'number',
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
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
                        positional: true,
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
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
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
                        positional: true,
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
                unconditional: false,
                conditions: [{
                    test: {
                        defaulted: [],
                        positional: true,
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
                        positional: true,
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
                    $ => $.header.flag == 1, [[ 'a' ], 2 ],
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
                    unconditional: false,
                    conditions: [{
                        test: {
                            defaulted: [],
                            positional: true,
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
                            positional: true,
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
                            positional: true,
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
                    unconditional: false,
                    conditions: [{
                        test: {
                            defaulted: [],
                            positional: true,
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
                            positional: true,
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
                            positional: true,
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
                    value => value <= 0x3fff, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                    value => value <= 0x1fffff, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ],
                    true, [ 32, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ]
                ],
                [ 8,
                    sip => sip & 0x80 == 0, 8,
                    true, [ 8,
                        sip => sip & 0x80 == 0, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                        true, [ 8,
                            sip => sip & 0x80 == 0, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ],
                            // TODO Maybe we always mask since we mask anyway?
                            true, [ 32, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ]
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
            unconditional: false,
            conditions: [{
                test: {
                    defaulted: [],
                    positional: true,
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
                    positional: true,
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
                    positional: true,
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
            unconditional: false,
            conditions: [{
                test: {
                    defaulted: [],
                    positional: true,
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
                    type: 'sip',
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
                    unconditional: false,
                    conditions: [{
                        test: {
                            defaulted: [],
                            positional: true,
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
                            type: 'sip',
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
                            unconditional: false,
                            conditions: [{
                                test: {
                                    defaulted: [],
                                    positional: true,
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
