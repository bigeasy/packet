require('./proof')(0, function (parse) {
    parse({
        message:        'negative',
        pattern:        'foo: -b8',
        bytes:          [ 0xff ],
        length:         1,
        expected:       { foo: -1 },
        require:        true
    })
    parse({
        message:        'minimum',
        pattern:        'foo: -b8',
        bytes:          [ 0x80 ],
        length:         1,
        expected:       { foo: -128 },
        require:        true
    })
    parse({
        message:        'maximum',
        pattern:        'foo: -b8',
        bytes:          [ 0x7f ],
        length:         1,
        expected:       { foo: 127 },
        require:        true
    })
    parse({
        message:        'positive',
        pattern:        'foo: -b8',
        bytes:          [ 0x02 ],
        length:         1,
        expected:       { foo: 2 },
        require:        true
    })
})
