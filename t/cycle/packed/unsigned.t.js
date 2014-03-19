require('../proof')(0, function (cycle) {
    cycle({
        message:        'byte',
        pattern:        'b16{one: b4, two: b8, three: b4}',
        object:         { one: 0x7, two: 0xaa, three: 0x7 },
        buffer:         [ 0x7a, 0xa7 ],
        types:          'bff'
    })
})
