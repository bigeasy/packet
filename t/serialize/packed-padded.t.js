require('./proof')(0, function (serialize) {
    serialize({
        message:        'write a bit packed integer with padded field',
        pattern:        'b16{x1{1},foo: b15}',
        object:         { foo: 258 },
        length:         2,
        expected:       [ 0x81, 0x02 ],
        require:        true
    })
})
