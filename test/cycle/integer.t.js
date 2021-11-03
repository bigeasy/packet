require('proof')(286, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'integer/spread/set/short',
        define: {
            object: {
                nudge: 8,
                value: [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            value: 0x81,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'integer/spread/unset/short',
        define: {
            object: {
                nudge: 8,
                value: [ 16, 7, 7 ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            value: 0x81,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'integer/byte/whole',
        define: {
            object: { word: 8 }
        },
        objects: [{ word: 0xab }]
    })
    /* TODO
    cycle(okay, {
        name: 'integer/byte/negative',
        define: {
            object: { word: -8 }
        },
        objects: [{ word: -0x7b }]
    })
    */
    cycle(okay, {
        name: 'integer/be/word/short',
        define: {
            object: { value: 16 }
        },
        objects: [{ value: 0xabcd }]
    })
    cycle(okay, {
        name: 'integer/be/word/int',
        define: {
            object: { value: 32 }
        },
        objects: [{ value: 0xabcdef01 }]
    })
    cycle(okay, {
        name: 'integer/be/compliment/short',
        define: {
            object: { value: -16 }
        },
        objects: [{ value: 0x7bcd }]
    })
    cycle(okay, {
        name: 'integer/be/compliment/int',
        define: {
            object: { value: -32 }
        },
        objects: [{ value: 0x7bcdef01 }]
    })
    cycle(okay, {
        name: 'integer/le/word/short',
        define: {
            object: { value: ~16 }
        },
        objects: [{ value: 0xabcd }]
    })
    cycle(okay, {
        name: 'integer/le/word/int',
        define: {
            object: { value: ~32 }
        },
        objects: [{ value: 0xabcdef01 }]
    })
    cycle(okay, {
        name: 'integer/le/compliment/short',
        define: {
            object: { value: -~16 }
        },
        objects: [{ value: -0x7bcd }]
    })
    cycle(okay, {
        name: 'integer/le/compliment/int',
        define: {
            object: { value: -~32 }
        },
        objects: [{ value: -0x7bcdef01 }]
    })
}
