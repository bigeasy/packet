require('./proof')(0, function (serialize) {
    serialize({
        message:        'write a 16 bit integer after skipping 2 bytes',
        buffer:         [ 0xff, 0xff, 0xaa, 0xaa ],
        pattern:        'x16, foo: b16',
        object:         { foo: 1 },
        length:         4,
        expected:       [ 0xff, 0xff, 0x00, 0x01 ],
        require:        true
    })
    serialize({
        message:        'write a 16 bit integer after padding 2 bytes',
        buffer:         [ 0xff, 0xff, 0xaa, 0xaa ],
        pattern:        'x16{0xaa55}, foo: b16',
        object:         { foo: 1 },
        length:         4,
        expected:       [ 0xaa, 0x55, 0x00, 0x01 ],
        require:        true
    })
})
