require('./proof')(0, function (cycle) {
    cycle({
        message:        'array',
        pattern:        'foo: b16[4]',
        object:         { foo: [ 1, 2, 3, 4 ]  },
        buffer:         [ 0x0, 0x01, 0x0, 0x2, 0x0, 0x3, 0x0, 0x4 ],
        types:          'bff'
    })
})
