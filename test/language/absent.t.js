require('proof')(2, okay => {
    const simplified = require('../../simplified')
    okay(simplified({
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
    okay(simplified({
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
