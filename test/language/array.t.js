require('proof')(11, okay => {
    const language = require('../../language')
    okay(language({ packet: { value: [ 16, [ 16 ] ] } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: false,
        bits: 0,
        dotted: '',
        fields: [{
            type: 'lengthEncoded',
            vivify: 'array',
            name: 'value',
            dotted: '.value',
            fixed: false,
            bits: 0,
            encoding: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                fixed: true,
                endianness: 'big',
                compliment: false
            }]
        }]
    }], 'length encoded')
    okay(language({ packet: { value: [ 16, [{ first: 16, second: 16 }] ] } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: false,
        bits: 0,
        dotted: '',
        fields: [{
            type: 'lengthEncoded',
            vivify: 'array',
            name: 'value',
            dotted: '.value',
            fixed: false,
            bits: 0,
            encoding: [{
                dotted: '',
                type: 'integer',
                vivify: 'number',
                fixed: true,
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                type: 'structure',
                vivify: 'object',
                dotted: '',
                bits: 32,
                fixed: true,
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    name: 'first',
                    dotted: '.first',
                    vivify: 'number',
                    fixed: true,
                    bits: 16,
                    bytes: [{
                        mask: 255, size: 8, shift: 8, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }, {
                    type: 'integer',
                    vivify: 'number',
                    name: 'second',
                    dotted: '.second',
                    fixed: true,
                    bits: 16,
                    bytes: [{
                        mask: 255, size: 8, shift: 8, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'length encoded fixed')
    okay(language({ packet: { value: [ 16, [[ 16, [ 16 ] ]] ] } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: false,
        bits: 0,
        dotted: '',
        fields: [{
            type: 'lengthEncoded',
            vivify: 'array',
            name: 'value',
            dotted: '.value',
            fixed: false,
            bits: 0,
            encoding: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                dotted: '',
                type: 'lengthEncoded',
                vivify: 'array',
                fixed: false,
                bits: 0,
                encoding: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    bytes: [{
                        mask: 255, size: 8, shift: 8, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }],
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 16,
                    bytes: [{
                        mask: 255, size: 8, shift: 8, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }]
        }]
    }], 'length encoded nested')
    okay(language({ packet: { value: [ 16, [{ first: [ 16, [ 16 ] ] }] ] } }), [{
        name: 'packet',
        fixed: false,
        bits: 0,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            type: 'lengthEncoded',
            vivify: 'array',
            name: 'value',
            dotted: '.value',
            fixed: false,
            bits: 0,
            encoding: [{
                dotted: '',
                type: 'integer',
                vivify: 'number',
                fixed: true,
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
            }],
            fields: [{
                type: 'structure',
                vivify: 'object',
                dotted: '',
                bits: 0,
                fixed: false,
                fields: [{
                    type: 'lengthEncoded',
                    vivify: 'array',
                    name: 'first',
                    dotted: '.first',
                    fixed: false,
                    bits: 0,
                    encoding: [{
                        dotted: '',
                        type: 'integer',
                        vivify: 'number',
                        fixed: true,
                        bits: 16,
                        bytes: [{
                            mask: 255, size: 8, shift: 8, upper: 0
                        }, {
                            mask: 255, size: 8, shift: 0, upper: 0
                        }],
                        endianness: 'big',
                        compliment: false
                    }],
                    fields: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bits: 16,
                        bytes: [{
                            mask: 255, size: 8, shift: 8, upper: 0
                        }, {
                            mask: 255, size: 8, shift: 0, upper: 0
                        }],
                        endianness: 'big',
                        compliment: false
                    }]
                }]
            }]
        }]
    }], 'length encoded variable')
    okay(language({
        packet: {
            value: [ 16, [ Buffer ] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 0,
        fields: [
          {
            type: 'lengthEncoded',
            vivify: 'array',
            encoding: [
              {
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
              }
            ],
            dotted: '.value',
            bits: 0,
            fixed: false,
            fields: [
              {
                type: 'buffer',
                vivify: 'number',
                dotted: '',
                concat: true,
                bits: 8,
                fixed: true,
                endianness: 'big',
                compliment: false
              }
            ],
            name: 'value'
          }
        ],
        name: 'packet'
    }], 'length encoded catenated')
    okay(language({
        packet: {
            value: [ 16, [[ Buffer ]] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 0,
        fields: [
          {
            type: 'lengthEncoded',
            vivify: 'array',
            encoding: [
              {
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bits: 16,
                bytes: [{
                    mask: 255, size: 8, shift: 8, upper: 0
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
              }
            ],
            dotted: '.value',
            bits: 0,
            fixed: false,
            fields: [
              {
                type: 'buffer',
                vivify: 'number',
                dotted: '',
                concat: false,
                bits: 8,
                fixed: true,
                endianness: 'big',
                compliment: false
              }
            ],
            name: 'value'
          }
        ],
        name: 'packet'
    }], 'length encoded chunked')
    okay(language({
        object: {
            type: 8,
            value: [ [ 16, 0x80, 7, 0x0, 8 ], [ 8 ] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 8,
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 } ],
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'lengthEncoded',
            vivify: 'array',
            encoding: [{
                type: 'integer',
                bits: 16,
                fixed: true,
                dotted: '',
                vivify: 'number',
                bytes: [{
                    mask: 127, size: 7, shift: 8, upper: 128
                }, {
                    mask: 255, size: 8, shift: 0, upper: 0
                }],
                endianness: 'big',
                compliment: false
            }],
            dotted: '.value',
            bits: 0,
            fixed: false,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                bits: 8,
                endianness: 'big',
                compliment: false
            }],
            name: 'value'
        }],
        name: 'object'
    }], 'spread length')
    okay(language({
        object: {
            type: 8,
            value: [[
                $ => $.type == 0, 8,
                $ => $.type == 1, 16
            ], [ 8 ] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 8,
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 } ],
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'lengthEncoded',
            vivify: 'array',
            encoding: [{
                type: 'conditional',
                bits: 0,
                fixed: false,
                vivify: 'number',
                dotted: '',
                split: false,
                serialize: {
                    conditions: [{
                        test: {
                            defaulted: [],
                            properties: [],
                            source: '$ => $.type == 0',
                            arity: 1,
                            vargs: []
                        },
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
                    }, {
                        test: {
                            defaulted: [],
                            properties: [],
                            source: '$ => $.type == 1',
                            arity: 1,
                            vargs: []
                        },
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
                          }
                        ]
                      }
                    ]
                },
                parse: {
                  sip: null,
                  conditions: [{
                      test: {
                          defaulted: [],
                          properties: [],
                          source: '$ => $.type == 0',
                          arity: 1,
                          vargs: []
                      },
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
                  }, {
                      test: {
                          defaulted: [],
                          properties: [],
                          source: '$ => $.type == 1',
                          arity: 1,
                          vargs: []
                      },
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
            }],
            dotted: '.value',
            bits: 0,
            fixed: false,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                bits: 8,
                endianness: 'big',
                compliment: false
            }],
            name: 'value'
        }],
        name: 'object'
    }], 'mirrored conditional length')
    okay(language({
        object: {
            type: 8,
            value: [[
                [
                    $ => $.type == 0, 8,
                    $ => $.type == 1, 16
                ], [
                    $ => $.type == 0, 8,
                    $ => $.type == 1, 16
                ]
            ], [ 8 ] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 8,
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 } ],
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'lengthEncoded',
            vivify: 'array',
            encoding: [{
                type: 'conditional',
                bits: 0,
                fixed: false,
                vivify: 'number',
                dotted: '',
                split: true,
                serialize: {
                    conditions: [{
                        test: {
                            defaulted: [],
                            properties: [],
                            source: '$ => $.type == 0',
                            arity: 1,
                            vargs: []
                        },
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
                    }, {
                        test: {
                            defaulted: [],
                            properties: [],
                            source: '$ => $.type == 1',
                            arity: 1,
                            vargs: []
                        },
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
                          }
                        ]
                      }
                    ]
                },
                parse: {
                    type: 'parse',
                    vivify: 'number',
                    sip: null,
                    conditions: [{
                        test: {
                            defaulted: [],
                            properties: [],
                            source: '$ => $.type == 0',
                            arity: 1,
                            vargs: []
                        },
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
                    }, {
                        test: {
                            defaulted: [],
                            properties: [],
                            source: '$ => $.type == 1',
                            arity: 1,
                            vargs: []
                        },
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
            }],
            dotted: '.value',
            bits: 0,
            fixed: false,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                bits: 8,
                endianness: 'big',
                compliment: false
            }],
            name: 'value'
        }],
        name: 'object'
    }], 'split conditional length')
    okay(language({
        object: {
            type: 8,
            value: [[
                [
                    value => value < 128, 8,
                    true, [ 16, 0x80, 7, 0x0, 8 ]
                ], [ 8,
                    sip => sip & 0x80 == 0, 8,
                    true, [ 16, 0x80, 7, 0x0, 8 ]
                ]
            ], [ 8 ] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 8,
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 } ],
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'lengthEncoded',
            vivify: 'array',
            encoding: [{
                type: 'conditional',
                bits: 0,
                fixed: false,
                vivify: 'number',
                dotted: '',
                split: true,
                serialize: {
                    conditions: [{
                        test: {
                            defaulted: [],
                            properties: [],
                            source: 'value => value < 128',
                            arity: 1,
                            vargs: []
                        },
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
                    }, {
                        test: null,
                        fields: [{
                            type: 'integer',
                            vivify: 'number',
                            dotted: '',
                            fixed: true,
                            bytes: [{
                                mask: 127, size: 7, shift: 8, upper: 128
                            }, {
                                mask: 255, size: 8, shift: 0, upper: 0
                            }],
                            bits: 16,
                            endianness: 'big',
                            compliment: false
                          }
                        ]
                      }
                    ]
                },
                parse: {
                    type: 'parse',
                    vivify: 'number',
                    sip: [{
                        type: 'integer',
                        vivify: 'number',
                        dotted: '',
                        fixed: true,
                        bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                        bits: 8,
                        endianness: 'big',
                        compliment: false
                    }],
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
                            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                            bits: 8,
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
                              bytes: [{
                                  mask: 127, size: 7, shift: 8, upper: 128
                              }, {
                                  mask: 255, size: 8, shift: 0, upper: 0
                              }],
                              bits: 16,
                              endianness: 'big',
                              compliment: false
                        }]
                    }]
                }
            }],
            dotted: '.value',
            bits: 0,
            fixed: false,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                bits: 8,
                endianness: 'big',
                compliment: false
            }],
            name: 'value'
        }],
        name: 'object'
    }], 'sip conditional length')
    okay(language({
        object: {
            type: 8,
            value: [[ $ => $.type == 0, [
                { $_: 0 }, 8,
                { $_: 1 }, 16
            ]], [ 8 ] ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 8,
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 } ],
            bits: 8,
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'lengthEncoded',
            vivify: 'array',
            encoding: [{
                type: 'switch',
                bits: 0,
                dotted: '',
                fixed: false,
                vivify: 'number',
                stringify: false,
                select: {
                    defaulted: [],
                    properties: [],
                    source: '$ => $.type == 0',
                    arity: 1,
                    vargs: []
                },
                cases: [{
                    value: 0,
                    otherwise: false,
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
                }, {
                    value: 1,
                    otherwise: false,
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
            }],
            dotted: '.value',
            bits: 0,
            fixed: false,
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '',
                fixed: true,
                bytes: [{ mask: 255, size: 8, shift: 0, upper: 0 }],
                bits: 8,
                endianness: 'big',
                compliment: false
            }],
            name: 'value'
        }],
        name: 'object'
    }], 'switched length')
})
