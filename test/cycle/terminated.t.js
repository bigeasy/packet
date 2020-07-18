require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    /* cycle(okay, {
        name: 'terminated/words',
        define: {
            object: {
                nudge: 8,
                array: [ [ 16 ], 0x0, 0x0 ],
                sentry: 8  }
        },
        objects: [{
            nudge: 0xaa, array: [ 0x0012, 0x4567, 0x890a, 0xcdef ], sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'terminated/nested',
        define: {
            object: {
                nudge: 8,
                array: [ [ [ [ 16 ], 0x0, 0x0 ] ], 0x0, 0x0 ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            array: [ [ 0x1234, 0x4567 ], [ 0x890a, 0xcdef ] ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'terminated/concat',
        define: {
            object: {
                nudge: 8,
                array: [ [ Buffer ], 0xd, 0xa ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: Buffer.from('abcdefghij'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('abcdefghi\r'), sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'terminated/chunked',
        define: {
            object: {
                nudge: 8,
                array: [ [[ Buffer ]], 0xd, 0xa ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: [ Buffer.from('abcdefghij\r') ], sentry: 0xaa
        }],
        stopAt: 'serialize.chk'
    }) */
    cycle(okay, {
        name: 'terminated/rewind',
        define: {
            object: {
                nudge: 8,
                // array: [ [ Buffer ], 0xa, 0xb, 0xa, 0xb, 0xc ],
                // array: [ [ Buffer ], 0xa, 0xb, 0xc, 0xa, 0xb, 0xd ],
                array: [ [ Buffer ] ].concat(Buffer.from('abcabd').toJSON().data),
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, array: Buffer.from('xaa'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xax'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xabx'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xaba'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xabcx'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xabcax'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xabcax'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xabcabx'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xabcab'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('xabcabc'), sentry: 0xaa
        }, {
            nudge: 0xaa, array: Buffer.from('x'), sentry: 0xaa
        }],
        stopAt: 'parse.inc'
    })
}
