require('../proof')(0, function (cycle) {
    cycle({
        message:        'signed',
        pattern:        'foo: -b32',
        object:         { foo: 1 },
        buffer:         [ 0x00, 0x00, 0x00, 0x01 ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: -b32',
        object:         { foo: -1 },
        buffer:         [ 0xff, 0xff, 0xff, 0xff ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: -b32',
        object:         { foo: 0x7fffffff },
        buffer:         [ 0x7f, 0xff, 0xff, 0xff ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: -b32',
        object:         { foo: -0x80000000 },
        buffer:         [ 0x80, 0x00, 0x00, 0x00 ],
        types:          'bff'
    })
})
