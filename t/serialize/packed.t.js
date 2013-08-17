require('./proof')(0, function (serialize) {
    serialize({
        message:        'write a bit packed integer',
        pattern:        'b8{x2, foo: b3, x3}',
        object:         { foo: 5 },
        length:         1,
        expected:       [ 0x28 ],
        require:        true
    })
    serialize({
        message:        'write a bit packed integer with two fields',
        pattern:        'b8{foo: b2, x1, bar: b2, x3}',
        object:         { foo: 3, bar: 2 },
        length:         1,
        expected:       [ 0xD0 ],
        require:        true
    })
})
