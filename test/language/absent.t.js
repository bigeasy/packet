require('proof')(2, okay => {
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
})
