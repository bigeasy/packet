require('../proof')(0, function (cycle) {
    cycle({
        message:        'byte',
        pattern:        'foo: b32',
        object:         { foo: 0x1010101 },
        buffer:         [ 0x01, 0x01, 0x01, 0x01 ],
        types:          'bff'
    })
})
