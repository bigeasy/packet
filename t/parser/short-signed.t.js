require('./proof')(0, function (parse) {
    parse({
        message:        'mininum',
        pattern:        'foo: -b16',
        bytes:          [ 0x80, 0x00 ],
        length:         2,
        expected:       { foo: -32768 },
        require:        true
    })
    parse({
        message:        'negative',
        pattern:        'foo: -b16',
        bytes:          [ 0xff, 0xff ],
        length:         2,
        expected:       { foo: -1 },
        require:        true
    })
    parse({
        message:        'maximum',
        pattern:        'foo: -b16',
        bytes:          [ 0x7f, 0xff ],
        length:         2,
        expected:       { foo: 32767 },
        require:        true
    })
    parse({
        message:        'positive',
        pattern:        'foo: -b16',
        bytes:          [ 0x01, 0x02 ],
        length:         2,
        expected:       { foo: 258 },
        require:        true
    })
})
