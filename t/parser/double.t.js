require('./proof')(0, function (parse) {
    parse({
        message:        'very negative',
        pattern:        'foo: l64f',
        bytes:          [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ],
        length:         8,
        expected:       { foo: -9.1819281981e3 },
        require:        true
    })
    parse({
        message:        'byte then negative double',
        pattern:        'foo: b8, bar: l64f',
        bytes:          new Buffer([ 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ]),
        length:         9,
        expected:       { foo: 1, bar: -10 },
        require:        true
    })
})
