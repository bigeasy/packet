require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'accumulator/object',
        define: {
            object: [{ counter: [ 0 ] }, [[[ function ({ $_, counter }) {
                assert.deepEqual(counter, [ 0 ])
                return $_
            } ]], {
                value: { first: 8, second: 8 },
                sentry: 8
            }]]
        },
        objects: [{ value: { first: 1, second: 2 }, sentry: 0xaa }],
        require: {
            assert: 'assert'
        }
    })
    cycle(okay, {
        name: 'accumulator/regex',
        define: {
            object: [{ regex: /^abc$/ }, [[[ function ({ $_, regex }) {
                assert(regex.test('abc'))
                return $_
            } ]], {
                value: { first: 8, second: 8 },
                sentry: 8
            }]]
        },
        objects: [{ value: { first: 1, second: 2 }, sentry: 0xaa }],
        require: {
            assert: 'assert'
        }
    })
}
