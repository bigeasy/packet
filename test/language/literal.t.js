require('proof')(4, okay => {
    const language = require('../../language')
    okay(language({
        packet: {
            literal: [ 'dc' ]
        }
    }), [{
        type: 'structure',
        name: 'packet',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 8,
        fields: [{
            type: 'literal',
            dotted: '',
            fixed: true,
            vivify: null,
            bits: 8,
            before: { repeat: 1, value: 'dc', bits: 8 },
            after: { repeat: 0, value: '', bits: 0 },
            fields: []
        }]
    }], 'constant')
    okay(language({
        packet: {
            header: [{
                before: [[ 2, '3' ], 2 ],
                after: [ 2, [ 2, '3' ]],
            }, 8 ]
        }
    }), [{
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 8,
        fields: [{
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
                type: 'literal',
                dotted: '.before',
                vivify: 'descend',
                fixed: true,
                bits: 4,
                before: { repeat: 1, value: '3', bits: 2 },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 2,
                    endianness: 'big',
                    compliment: false
                }],
                after: { repeat: 0, value: '', bits: 0 },
                name: 'before'
            }, {
                type: 'literal',
                dotted: '.after',
                vivify: 'descend',
                fixed: true,
                bits: 4,
                before: { repeat: 0, value: '', bits: 0 },
                fields: [{
                    type: 'integer',
                    vivify: 'number',
                    dotted: '',
                    fixed: true,
                    bits: 2,
                    endianness: 'big',
                    compliment: false
                }],
                after: { repeat: 1, value: '3', bits: 2 },
                name: 'after'
            }]
        }],
        name: 'packet'
    }], 'literal packed')
    okay(language({ packet: { value: [ '0faded' , 16, 'facade' ] } }), [{
        type: 'structure',
        vivify: 'object',
        name: 'packet',
        fixed: true,
        bits: 64,
        dotted: '',
        fields: [{
            type: 'literal',
            vivify: 'descend',
            dotted: '',
            fixed: true,
            name: 'value',
            dotted: '.value',
            before: {
                value: '0faded',
                repeat: 1,
                bits: 24
            },
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
            }],
            after: {
                value: 'facade',
                repeat: 1,
                bits: 24
            },
            bits: 64
        }]
    }], 'literal')
    okay(language({ packet: { value: [[ '0faded', 2 ], 16, [ 'facade', ~2 ]] } }), [{
        name: 'packet',
        fixed: true,
        bits: 112,
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fields: [{
            type: 'literal',
            vivify: 'descend',
            name: 'value',
            dotted: '.value',
            fixed: true,
            before: {
                value: '0faded',
                repeat: 2,
                bits: 24
            },
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
            }],
            after: {
                value: 'decafa',
                repeat: 2,
                bits: 24
            },
            bits: 112
        }]
    }], 'skip')
})
