require('./proof')(0, function (cycle) {
    cycle({
        message:        'very negative',
        pattern:        'foo: l64f',
        object:         { foo: -9.1819281981e3 },
        buffer:         [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ],
        types:          'bff'
    })
})
