require('./proof')(0, function (serialize) {
    serialize({
        message:    'little endian positive',
        pattern:    'foo: l32f',
        object:     { foo: 10.8 },
        length:     4,
        expected:   [ 0xcd, 0xcc, 0x2c, 0x41 ],
        require:    true
    })
    serialize({
        message:    'little endian negative',
        pattern:    'foo: l32f',
        object:     { foo: -10 },
        length:     4,
        expected:   [ 0x00, 0x00, 0x20, 0xc1 ],
        require:    true
    })
    serialize({
        message:    'big endian positive',
        pattern:    'foo: b32f',
        object:     { foo: 10.8 },
        length:     4,
        expected:   [ 0xcd, 0xcc, 0x2c, 0x41 ].reverse(),
        require:    true
    })
    serialize({
        message:    'big endian negative',
        pattern:    'foo: b32f',
        object:     { foo: -10 },
        length:     4,
        expected:   [ 0x00, 0x00, 0x20, 0xc1 ].reverse(),
        require:    true
    })
})
