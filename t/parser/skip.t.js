#!/usr/bin/env node
require('./proof')(0, function (parse) {
    parse({
        message: 'read a 16 bit integer after skipping two bytes',
        pattern: 'x16, foo: b16',
        bytes: [ 0x01, 0x02, 0x00, 0x01 ],
        length: 4,
        expected: { foo: 1 },
        require: true
    })
})
