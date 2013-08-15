require('./proof')(0, function (parse) {
    parse({
        message:        'little endian positive',
        pattern:        'foo: l32f',
        bytes:          [ 0xcd, 0xcc, 0x2c, 0x41 ],
        length:         4,
        expected:       { foo: 10.800000190734863 },
        require:        true
    })
    parse({
        message:        'little endian negative float',
        pattern:        'foo: l32f',
        bytes:          [ 0x00, 0x00, 0x20, 0xc1 ],
        length:         4,
        expected:       { foo: -10 },
        require:        true
    })
    parse({
        message:        'byte then little endian positive float',
        pattern:        'foo: b8, bar: l32f',
        bytes:          [ 0x01, 0xcd, 0xcc, 0x2c, 0x41 ],
        length:         5,
        expected:       { foo: 1, bar: 10.800000190734863 },
        require:        true
    })
    parse({
        message:        'big endian positive',
        pattern:        'foo: b32f',
        bytes:          [ 0xcd, 0xcc, 0x2c, 0x41 ].reverse(),
        length:         4,
        expected:       { foo: 10.800000190734863 },
        require:        true
    })
    // Two in a row.
    parse({
        message:        'two little endian floats in a row',
        pattern:        'foo: l32f, bar: l32f',
        bytes:          [ 0x00, 0x00, 0x20, 0xc1, 0xcd, 0xcc, 0x2c, 0x41 ],
        length:         8,
        expected:       { foo: -10, bar: 10.800000190734863 },
        require: true
    })
})
