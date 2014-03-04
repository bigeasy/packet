require('./proof')(0, function (cycle) {
    cycle({
        message:        'signed',
        pattern:        'foo: l32f',
        object:         { foo: 10.800000190734863 },
        buffer:         [ 0xcd, 0xcc, 0x2c, 0x41 ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: l32f',
        object:         { foo: -10 },
        buffer:         [ 0x00, 0x00, 0x20, 0xc1 ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: b32f',
        object:         { foo: 10.800000190734863 },
        buffer:         [ 0x41, 0x2c, 0xcc, 0xcd ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: b32f',
        object:         { foo: -10 },
        buffer:         [ 0xc1, 0x20, 0x00, 0x00 ],
        types:          'bff'
    })
})
