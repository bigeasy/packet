require('proof')(88, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'packed/nested',
        define: {
            object: {
                nudge: 8,
                header: [{
                    one: [[ 15, '5eaf' ], 2 ],
                    two: -3,
                    three: [[[ value => value ]], 1 ],
                    four: [ 5, [
                        'zero', 'one', 'two', 'three'
                    ]],
                    five: [ 6, 'aa' ]
                }, 32 ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            header: { one: 3, two: -4, three: 1, four: 'three' },
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'packed/elided',
        define: {
            object: {
                nudge: 8,
                _header: [{
                    one: [[ 15, '5eaf' ], 2 ],
                    two: -3,
                    three: [[[ value => value ]], 1 ],
                    four: [ 5, [
                        'zero', 'one', 'two', 'three'
                    ]],
                    five: [ 6, 'aa' ]
                }, 32 ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            one: 3, two: -4, three: 1, four: 'three',
            sentry: 0xaa
        }]
    })
}
