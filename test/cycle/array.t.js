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
                array: [ 8, [ Buffer ] ],
                // Need to force the best-foot-forward check.
                sentry: [
                    $ => false, 16,
                    $ => true, 8
                ]
            }
        },
        objects: [{
            array: Buffer.from('abcdefgh'),
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/chunked',
        define: {
            object: {
                array: [ 8, [[ Buffer ]] ],
                // Need to force the best-foot-forward check.
                sentry: [
                    $ => false, 16,
                    $ => true, 8
                ]
            }
        },
        objects: [{
            array: [ Buffer.from('abcdefgh') ],
            sentry: 0xaa
        }]
    })
}
