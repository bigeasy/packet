require('proof')(2, okay => {
    const language = require('../../language')
    // TODO Come back and complete when you've implemented nested structures.
    okay(language({
        object: {
            type: 8,
            value: [ $ => $.type, [
                { $_: 0 }, 8,
                { $_: [ 1 ] }, 16,
                { $_: [] }, 24
            ]]
        }
    }), [{
        dotted: '',
        fixed: false,
        bits: 8,
        type: 'structure',
        vivify: 'object',
        fields: [{
            type: 'integer',
            vivify: 'number',
            dotted: '.type',
            fixed: true,
            bits: 8,
            bytes: [{
                mask: 255, size: 8, shift: 0, upper: 0
            }],
            endianness: 'big',
            compliment: false,
            name: 'type'
        }, {
            type: 'switch',
            vivify: 'number',
            stringify: false,
            select: {
                properties: [],
                positional: true,
                defaulted: [],
                source: '$ => $.type',
                arity: 1,
                vargs: []
            },
            bits: 0,
            fixed: false,
            cases: [{
                value: 0,
                otherwise: false,
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 8,
                    bytes: [{
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
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
                    bits: 16,
                    bytes: [{
                        mask: 255, size: 8, shift: 8, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }, {
                value: null,
                otherwise: true,
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 24,
                    bytes: [{
                        mask: 255, size: 8, shift: 16, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 8, upper: 0
                    }, {
                        mask: 255, size: 8, shift: 0, upper: 0
                    }],
                    endianness: 'big',
                    compliment: false
                }]
            }],
            name: 'value',
            dotted: '.value'
          }
        ],
        name: 'object'
    }], 'variant switch')
    okay(language({
        object: {
            header: [{
                type: 2,
                value: [ $ => $.type, [
                    { $_: 0 },  6 ,
                    { $_: [ 1 ] }, [[ 'a' ], 2 ],
                    { $_: [] }, [{ two: 2, four: 4 }, 6 ]
                ]]
            }, 8 ]
        }
    }), [{
        dotted: '',
        fixed: true,
        bits: 8,
        type: 'structure',
        vivify: 'object',
        fields: [
          {
            type: 'integer',
            vivify: 'object',
            dotted: '.header',
            fixed: true,
            bits: 8,
            bytes: [{
                mask: 255, size: 8, shift: 0, upper: 0
            }],
            endianness: 'big',
            compliment: false,
            name: 'header',
            fields: [{
                type: 'integer',
                vivify: 'number',
                dotted: '.type',
                fixed: true,
                bits: 2,
                endianness: 'big',
                compliment: false,
                name: 'type'
            }, {
                type: 'switch',
                vivify: 'variant',
                stringify: false,
                select: {
                    defaulted: [],
                    positional: true,
                    properties: [],
                    source: '$ => $.type',
                    arity: 1,
                    vargs: []
                },
                bits: 6,
                fixed: true,
                cases: [{
                    value: 0,
                    otherwise: false,
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
                    value: 1,
                    otherwise: false,
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
                    value: null,
                    otherwise: true,
                    fields: [{
                        dotted: '',
                        fixed: true,
                        bits: 6,
                        type: 'integer',
                        compliment: false,
                        endianness: 'big',
                        vivify: 'object',
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
                }],
                name: 'value',
                dotted: '.value'
            }]
        }],
        name: 'object'
    }], 'packed variant')
})
