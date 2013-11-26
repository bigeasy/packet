require('../proof')(0, function (cycle) {
    cycle({
        message:        'byte',
        pattern:        'foo: b8',
        object:         { foo: 1 },
        buffer:         [ 0x1 ],
        types:          'bff'
    })
})
