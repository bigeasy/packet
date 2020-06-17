require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'integer/be/word/short',
        define: {
            object: { value: 16 }
        },
        objects: [{ value: 0xabcd }]
    })
    require('./cycle')(okay, {
        name: 'integer/be/word/int',
        define: {
            object: { value: 32 }
        },
        objects: [{ value: 0xabcdef01 }]
    })
    require('./cycle')(okay, {
        name: 'integer/be/word/long',
        define: {
            object: { value: 64 }
        },
        objects: [{ value: 0xaaaaaaaaaaaaaaaan }]
    })
    require('./cycle')(okay, {
        name: 'integer/be/compliment/short',
        define: {
            object: { value: -16 }
        },
        objects: [{ value: 0x7bcd }]
    })
    require('./cycle')(okay, {
        name: 'integer/be/compliment/int',
        define: {
            object: { value: -32 }
        },
        objects: [{ value: 0x7bcdef01 }]
    })
    require('./cycle')(okay, {
        name: 'integer/be/compliment/long',
        define: {
            object: { value: -64 }
        },
        objects: [{ value: -0x7aaaaaaaaaaaaaaan }]
    })
    require('./cycle')(okay, {
        name: 'integer/le/word/short',
        define: {
            object: { value: ~16 }
        },
        objects: [{ value: 0xabcd }]
    })
    require('./cycle')(okay, {
        name: 'integer/le/word/int',
        define: {
            object: { value: ~32 }
        },
        objects: [{ value: 0xabcdef01 }]
    })
    require('./cycle')(okay, {
        name: 'integer/le/word/long',
        define: {
            object: { value: ~64 }
        },
        objects: [{ value: 0xaaaaaaaaaaaaaaaan }]
    })
    require('./cycle')(okay, {
        name: 'integer/le/compliment/short',
        define: {
            object: { value: -~16 }
        },
        objects: [{ value: -0x7bcd }]
    })
    require('./cycle')(okay, {
        name: 'integer/le/compliment/int',
        define: {
            object: { value: -~32 }
        },
        objects: [{ value: -0x7bcdef01 }]
    })
    require('./cycle')(okay, {
        name: 'integer/le/compliment/long',
        define: {
            object: { value: -~64 }
        },
        objects: [{ value: -0x7aaaaaaaaaaaaaaan }]
    })
}
