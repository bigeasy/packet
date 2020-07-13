require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'array/words',
        define: {
            object: { array: [ 16, [ 16 ] ], sentry: 8  }
        },
        objects: [{ array: [ 0x1236, 0x4567, 0x890a, 0xcdef ], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'array/fixed',
        define: {
            object: { array: [ 16, [{ first: 16, second: 16 }] ], sentry: 8 }
        },
        objects: [{
            array: [{
                first: 0x1234, second: 0x4567
            }, {
                first: 0x89a0, second: 0xcdef
            }],
            sentry: 1
        }]
    })
    cycle(okay, {
        name: 'array/nested',
        define: {
            object: { array: [ 16, [[ 16, [ 16 ] ]] ], sentry: 8 }
        },
        objects: [{ array: [[ 0x1234, 0x4567 ], [ 1, 2 ]], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'array/variable',
        define: {
            object: { array: [ 16, [{ first: [ 16, [ 16 ] ] }] ], sentry: 8 }
        },
        objects: [{
            array: [{
                first:  [ 0x1234, 0x4567 ]
            }, {
                first: [ 1, 2 ]
            }],
            sentry: 8
        }]
    })
    cycle(okay, {
        name: 'array/concat',
        define: {
            object: {
                type: 8,
                array: [ 8, [ Buffer ] ],
                // Need to force the best-foot-forward check.
                sentry: [
                    $ => $.type == 0, 8,
                    $ => true, 16
                ]
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            type: 0,
            array: Buffer.from('abcdefgh'),
            sentry: 0xaa
        }, {
            type: 1,
            array: Buffer.from('abcdefgh'),
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/chunked',
        define: {
            object: {
                type: 8,
                array: [ 8, [[ Buffer ]] ],
                // Need to force the best-foot-forward check.
                sentry: [
                    $ => $.type == 0, 8,
                    true, 16
                ]
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            type: 0,
            array: [ Buffer.from('abcdefgh') ],
            sentry: 0xaa
        }, {
            type: 1,
            array: [ Buffer.from('abcdefgh') ],
            sentry: 0xaa
        }]
    })
}
