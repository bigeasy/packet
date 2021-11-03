require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'accumulator/elided',
        define: {
            object: [{ hash: () => crypto.createHash('md5') }, {
                body: [[[
                    ({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end))
                ]], {
                    number: 32,
                    data: [[ 8 ], 0x0 ]
                }],
                checksum: [[
                    ({ $_, hash }) => $_ = hash.digest()
                ], [[ 16 ], [ Buffer ]], [
                    ({ checksum = 0, hash }) => {
                        assert.deepEqual(hash.digest().toJSON(), checksum.toJSON())
                    }
                ]]
            }]
        },
        objects: [{
            body: {
                number: 1,
                data: [ 0x41, 0x42, 0x43 ]
            },
            checksum: Buffer.from([ 0xc9, 0xd0, 0x87, 0xbd, 0x2f, 0x8f, 0x4a, 0x33, 0xd4, 0xeb, 0x2d, 0xe4, 0x47, 0xc0, 0x40, 0x28 ])
        }],
        require: { crypto: 'crypto', assert: 'assert' }
    })
    return
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
                console.log('>>>', counter)
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
        name: 'accumulator/conditional',
        define: {
            object: {
                _counted: [{ counter: [ 0 ] }, [[[
                    function ({ $start, $end, counter }) {
                        counter[0] += $end - $start
                    }
                ]], {
                    length: 32,
                    string: [[ 8 ], 0x0 ],
                    number: [               // Number occupying remaining bytes.
                        ({ $, counter }) => $.length - counter[0] == 1, 8,
                        ({ $, counter }) => $.length - counter[0] == 2, 16,
                        true, 32
                    ]
                }]],
                sentry: 8
            }
        },
        objects: [{
                length: 4 + 11 + 1,
                string: Buffer.from('abcdefghij').toJSON().data,
                number: 1,
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
        }],
        stopAt: 'serialize.inc'
    })
    cycle(okay, {
        name: 'accumulator/switch',
        define: {
            object: {
                counted: [{ counter: [ 0 ] }, [[[
                    function ({ $start, $end, counter }) {
                        counter[0] += $end - $start
                    }
                ]], {
                    length: 32,
                    string: [[ 8 ], 0x0 ],
                    // Number occupying remaining bytes.
                    number: [ ({ $, counter }) => $.counted.length - counter[0], [
                        { $_: 1 }, 8,
                        { $_: 2 }, 16,
                        { $_: [] }, 32
                    ]]
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
    cycle(okay, {
        name: 'accumulator/checksum',
        define: {
            object: [{ hash: () => crypto.createHash('md5') }, {
                body: [[[
                    ({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end))
                ]], {
                    number: 32,
                    data: [[ 8 ], 0x0 ]
                }],
                checksum: [[
                    ({ $_, hash }) => $_ = hash.digest()
                ], [[ 16 ], [ Buffer ]], [
                    ({ checksum = 0, hash }) => {
                        assert.deepEqual(hash.digest().toJSON(), checksum.toJSON())
                    }
                ]]
            }]
        },
        objects: [{
            body: {
                number: 1,
                data: [ 0x41, 0x42, 0x43 ]
            },
            checksum: Buffer.from([ 0xc9, 0xd0, 0x87, 0xbd, 0x2f, 0x8f, 0x4a, 0x33, 0xd4, 0xeb, 0x2d, 0xe4, 0x47, 0xc0, 0x40, 0x28 ])
        }],
        require: { crypto: 'crypto', assert: 'assert' }
    })
}
