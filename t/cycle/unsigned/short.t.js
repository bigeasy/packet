require('../proof')(0, function (cycle) {
    cycle({
        message:        'short',
        pattern:        'foo: b16',
        object:         { foo: 0x101 },
        buffer:         [ 0x1, 0x1 ],
        types:          'bff'
    })
})
