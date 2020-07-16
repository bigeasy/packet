require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'fixed/words/unpadded',
        define: {
            object: {
                array: [ [ 4 ], [ 16 ] ],
                sentry: 8
            }
        },
        objects: [{
            array: [ 0xabcd, 0xdcba, 0xabcd, 0xdbca ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'fixed/words/single',
        define: {
            object: {
                array: [ [ 8 ], [ 8 ], 0x0 ],
                sentry: 8
            }
        },
        objects: [{
            array: [ 0xa, 0xb, 0xc, 0xd, 0xa, 0xb, 0xc, 0xd ],
            sentry: 0xaa
        }, {
            array: [ 0xa, 0xb, 0xc, 0xd ],
            sentry: 0xaa
        }]
    })
    // **TODO** What do you with a multi-byte terminator when there is only
    // partial room for it to fit?
    cycle(okay, {
        name: 'fixed/words/multi',
        define: {
            object: {
                array: [ [ 16 ], [ 8 ], 0xd, 0xa ],
                sentry: 8
            }
        },
        objects: [{
            array: Buffer.from('hello, world').toJSON().data,
            sentry: 0xaa
        }, {
            array: Buffer.from('hello, world!!!!').toJSON().data,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'fixed/concat/unpadded',
        define: {
            object: {
                nudge: 8,
                array: [ [ 8 ], [ Buffer ] ],
                sentry: 8
            }
        },
        objects: [{ nudge: 0xaa, array: Buffer.from('abcdefgh'), sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'fixed/concat/single',
        define: {
            object: {
                nudge: 8,
                array: [ [ 8 ], [ Buffer ], 0x0 ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: Buffer.from('abcdefgh'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('abcd'), sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'fixed/concat/multiple',
        define: {
            object: {
                nudge: 8,
                array: [ [ 8 ], [ Buffer ], 0xa, 0xb ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: Buffer.from('abcdefgh'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('abcd'), sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'fixed/chunked/unpadded',
        define: {
            object: {
                nudge: 8,
                array: [ [ 8 ], [[ Buffer ]] ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: [ Buffer.from('abcdefgh') ], sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'fixed/chunked/single',
        define: {
            object: {
                nudge: 8,
                array: [ [ 8 ], [[ Buffer ]], 0x0 ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: [ Buffer.from('abcd') ], sentry: 0xaa
        }, {
            nudge: 0xaa, array: [ Buffer.from('abcdefgh') ], sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'fixed/chunked/multiple',
        define: {
            object: {
                nudge: 8,
                array: [ [ 8 ], [[ Buffer ]], 0xd, 0xa ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: [ Buffer.from('abcd') ], sentry: 0xaa
        }, {
            nudge: 0xaa, array: [ Buffer.from('abcdefgh') ], sentry: 0xaa
        }]
    })
}
