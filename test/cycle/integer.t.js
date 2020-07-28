require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
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
        name: 'integer/be/word/long',
        define: {
            object: { value: 64 }
        },
        objects: [{ value: 0xaaaaaaaaaaaaaaaan }]
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
        name: 'integer/be/compliment/long',
        define: {
            object: { value: -64 }
        },
        objects: [{ value: -0x7aaaaaaaaaaaaaaan }]
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
        name: 'integer/le/word/long',
        define: {
            object: { value: ~64 }
        },
        objects: [{ value: 0xaaaaaaaaaaaaaaaan }]
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
    cycle(okay, {
        name: 'integer/le/compliment/long',
        define: {
            object: { value: -~64 }
        },
        objects: [{ value: -0x7aaaaaaaaaaaaaaan }]
    })
}
