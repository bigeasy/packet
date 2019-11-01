function generalized (okay, construct, object, expected) {
    for (let i = 0; i <= expected.length; i++) {
        const buffer = Buffer.alloc(expected.length)
        let start = 0
        let serialize = construct(object)
        {
            ({ start, serialize } = serialize(buffer, start, expected.length - i))
        }
        if (serialize != null) {
            ({ start, serialize } = serialize(buffer, start, buffer.length))
        }
        okay({ start, serialize }, {
            start: expected.length,
            serialize: null
        }, 'end state ' + i)
        okay(buffer.toJSON().data, expected, 'serialized ' + i)
    }
}

module.exports = generalized
