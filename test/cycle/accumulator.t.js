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
    cycle(okay, {
        name: 'accumulator/function',
        define: {
            object: [{ counter: () => [ 0 ] }, [[[ function ({ $_, counter }) {
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
        name: 'accumulator/counted',
        define: {
            object: {
                counted: [{ counter: [ 0 ] }, [[[
                    function ({ $start, $end, counter }) {
                        counter[0] += $end - $start
                    }
                ]], {
                    length: 32,
                    string: [[ 8 ], 0x0 ],
                    number: [               // Number occupying remaining bytes.
                        ({ $, counter }) => $.counted.length - counter[0] == 1, 8,
                        ({ $, counter }) => $.counted.length - counter[0] == 2, 16,
                        true, 32
                    ]
                }]],
                sentry: 8
            }
        },
        objects: [{
            counted: {
                length: 4 + 11 + 1,
                string: Buffer.from('abcdefghij').toJSON().data,
                number: 1
            },
            sentry: 0xaa
        }, {
            counted: {
                length: 4 + 11 + 2,
                string: Buffer.from('abcdefghij').toJSON().data,
                number: 1
            },
            sentry: 0xaa
        }, {
            counted: {
                length: 4 + 11 + 4,
                string: Buffer.from('abcdefghij').toJSON().data,
                number: 1
            },
            sentry: 0xaa
        }]
    })
}
