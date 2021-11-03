require('proof')(256, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'inline/elided',
        define: {
            object: {
                _elided: [[[ value => value ]], {
                    value: 16
                }]
            }
        },
        objects: [{ value: 1 }]
    })
    cycle(okay, {
        name: 'inline/both',
        define: {
            object: {
                value: [[ value => -value ], -16, [ value => -value ]],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'inline/before',
        define: {
            object: {
                value: [[ value => value ], 16 , []],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'inline/after',
        define: {
            object: {
                value: [[], 16, [ value => value ]],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'inline/mirrored',
        define: {
            object: {
                value: [[[ value => ~value ]], 32 ],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'inline/array',
        define: {
            object: {
                nudge: 8,
                value: [[[ function ($_) {
                    return $_.slice().reverse()
                } ]], [ 8, [ 8 ] ] ],
                sentry: 8
            }
        },
        objects: [{ nudge: 0xaa, value: [ 0xa, 0xb, 0xc, 0xd ], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'inline/named',
        define: {
            object: {
                value: [[[ function ({ $_, $, $path, $i, $direction }) {
                    const assert = require('assert')
                    if ($direction == 'serialize') {
                        assert.deepEqual({ $_, $, $path, $i, $direction }, {
                            $_: 1,
                            $: { value: 1, sentry: 0xaa },
                            $path: [ 'object', 'value' ],
                            $i: [],
                            $direction: 'serialize'
                        })
                    } else {
                        assert.deepEqual({ $_, $, $path, $i, $direction }, {
                            $_: 4294967294,
                            $: { value: 4294967294, sentry: 0 },
                            $path: [ 'object', 'value' ],
                            $i: [],
                            $direction: 'parse'
                        })
                    }
                    return ~$_
                } ]], 32 ],
                sentry: 8
            }
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
    // Issue: https://github.com/bigeasy/packet/issues/601
    cycle(okay, {
        name: 'inline/converted',
        define: {
            object: {
                value: [[
                    (value) => Buffer.from(String(value))
                ], [ [ Buffer ], 0x0 ], [
                    (value) => parseInt(value.toString(), 10)
                ] ],
                sentry: 8
            }
        },
        objects: [{ value: 32, sentry: 0xaa }]
    })
}
