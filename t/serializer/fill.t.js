require('./proof')(0, function (serialize) {
    serialize({
        message:      'fill',
        pattern:      'x16{0}, foo: b16',
        object:       { foo: 1 },
        length:       4,
        expected:     [ 0x00, 0x00, 0x00, 0x01 ],
        require:      true
    })
})
