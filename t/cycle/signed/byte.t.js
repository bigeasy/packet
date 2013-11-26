require('../proof')(0, function (cycle) {
    cycle({
        message:        'signed',
        pattern:        'foo: -b8',
        object:         { foo: 1 },
        buffer:         [ 0x1 ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: -b8',
        object:         { foo: -1 },
        buffer:         [ 0xff ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: -b8',
        object:         { foo: 127 },
        buffer:         [ 0x7f ],
        types:          'bff'
    })
    cycle({
        message:        'signed',
        pattern:        'foo: -b8',
        object:         { foo: -128 },
        buffer:         [ 0x80 ],
        types:          'bff'
    })
})
