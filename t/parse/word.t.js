require('./proof')(0, function (parse) {
    parse({
        message:        'word',
        pattern:        'foo: b16',
        bytes:          [ 0xA0, 0xB0 ],
        length:         2,
        expected:       { foo: 0xA0B0 },
        require:        true
    })
})
