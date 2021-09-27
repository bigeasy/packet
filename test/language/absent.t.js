require('proof')(3, okay => {
    const language = require('../../language')
    okay(language({
        packet: {
            value: null
        }
    }), [{
        name: 'packet',
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 0,
        fields: [{
            type: 'absent',
            name: 'value',
            dotted: '.value',
            vivify: 'variant',
            value: null,
            bits: 0,
            fixed: true
        }]
    }], 'null')
    okay(language({
        packet: {
            value: []
        }
    }), [{
        name: 'packet',
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: true,
        bits: 0,
        fields: [{
            type: 'absent',
            name: 'value',
            dotted: '.value',
            vivify: 'array',
            value: [],
            bits: 0,
            fixed: true
        }]
    }], 'array')
    okay(language({
        packet: {
            value: [ $ => 0, [
                { $_: 0 }, null
            ]]
        }
    }), [{
        name: 'packet',
        type: 'structure',
        vivify: 'object',
        dotted: '',
        fixed: false,
        bits: 0,
        fields: [{
            type: 'switch',
            name: 'value',
            dotted: '.value',
            select: {
                defaulted: [],
                positional: true,
                properties: [],
                source: '$ => 0',
                arity: 1,
                vargs: []
            },
            vivify: 'variant',
            stringify: false,
            bits: 0,
            fixed: false,
            cases: [{
                value: 0,
                otherwise: false,
                fields: [{
                    type: 'absent',
                    dotted: '',
                    vivify: 'variant',
                    value: null,
                    bits: 0,
                    fixed: true
                }]
            }]
        }]
    }], 'switch')
})
