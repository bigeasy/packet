require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    /*
    cycle(okay, {
        name: 'array/words',
        define: {
            object: { nudge: 8, array: [ 16, [ 16 ] ], sentry: 8  }
        },
        objects: [{ nudge: 0xaa, array: [ 0x1236, 0x4567, 0x890a, 0xcdef ], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'array/fixed',
        define: {
            object: { nudge: 8, array: [ 16, [{ first: 16, second: 16 }] ], sentry: 8 }
        },
        objects: [{
            nudge: 0xaa,
            array: [{
                first: 0x1234, second: 0x4567
            }, {
                first: 0x89a0, second: 0xcdef
            }],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/nested',
        define: {
            object: { nudge: 8, array: [ 16, [[ 16, [ 16 ] ]] ], sentry: 8 }
        },
        objects: [{ nudge: 0xaa, array: [[ 0x1234, 0x4567 ], [ 1, 2 ]], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'array/variable',
        define: {
            object: { nudge: 8, array: [ 16, [{ first: [ 16, [ 16 ] ] }] ], sentry: 8 }
        },
        objects: [{
            nudge: 0xaa,
            array: [{
                first:  [ 0x1234, 0x4567 ]
            }, {
                first: [ 1, 2 ]
            }],
            sentry: 0xaa
        }]
    })
    */
    cycle(okay, {
        name: 'array/concat',
        define: {
            object: {
                nudge: 8,
                array: [ 8, [ Buffer ] ],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: Buffer.from('abcdefgh'),
            sentry: 0xaa
        }]
    })
    return
    cycle(okay, {
        name: 'array/chunked',
        define: {
            object: {
                nudge: 8,
                array: [ 8, [[ Buffer ]] ],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: [ Buffer.from('abcdefgh') ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/wrapped',
        define: {
            $value: 8,
            object: {
                nudge: 8,
                // **TODO**: Inline should pass in buffer length.
                // **TODO**: Add this to the language tests.
                array: [ [[ 'cd', 1 ], [[ value => value ], '$value', [ value => value ]] ], [ 8 ] ],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: [ 0xa, 0xb, 0xc, 0xd ],
            sentry: 0xaa
        }]
    })
}
