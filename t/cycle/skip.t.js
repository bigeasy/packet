require('./proof')(0, function (cycle) {
    cycle({
        message:        'skip',
        pattern:        'x16, foo: b16',
        object:         { foo: 1 },
        buffer:         [ 0x0, 0x0, 0x0, 0x1 ],
        types:          'bff'
    })
})
