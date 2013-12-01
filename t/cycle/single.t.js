require('./proof')(0, function (cycle) {
    cycle({
        message:        'signed',
        pattern:        'foo: l32f',
        object:         { foo: 10.800000190734863 },
        buffer:         [ 0xcd, 0xcc, 0x2c, 0x41 ],
        types:          'bff'
    })
})
