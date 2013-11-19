require('./proof')(0, function (cycle) {
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
})
