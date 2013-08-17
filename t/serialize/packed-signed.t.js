require('./proof')(0, function (serialize) {
    serialize({
        message:        'write a bit packed signed negative integer',
        pattern:        'b8{x2, foo: -b3, x3}',
        object:         { foo: -4 },
        length:         1,
        expected:       [ 0x20 ],
        require:        true
    })
    serialize({
        message:        'write a bit packed signed integer',
        pattern:        'b8{x2, foo: -b3, x3}',
        object:         { foo: 3 },
        length:         1,
        expected:       [ 0x18 ],
        require:        true
    })
})
