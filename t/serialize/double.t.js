require('./proof')(0, function (serialize) {
    serialize({
        message:    'very negative',
        pattern:    'foo: l64f',
        object:     { foo: -9.1819281981e3 },
        length:     8,
        expected:   [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ],
        require:    true
    })
    serialize({
        message:    'negative',
        pattern:    'foo: l64f',
        object:     { foo: -10 },
        length:     8,
        expected:   [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ],
        require:    true
    })
})
