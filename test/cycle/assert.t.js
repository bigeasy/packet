require('proof')(60, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'assert/named',
        define: {
            object: {
                value: [[[ ({ value = 0 }) => require('assert').equal(value, 1) ]], 8 ],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'assert/dollarunder',
        define: {
            object: {
                value: [[[ ({ $_ = 0 }) => require('assert').equal($_, 1) ]], 8 ],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'assert/positional',
        define: {
            object: {
                value: [[[ ($_ = 0) => require('assert').equal($_, 1) ]], 8 ],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
}
