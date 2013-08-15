#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'b8(&0x80: b16{x1,foo:b15} | bar:b8)', [ 0x7f ], 1, { bar: 127 }, 'read a default after a masked alternative')
    parseEqual({ require: true }, 'b8(252/252-0xffff: x8{252}, foo: b16 | 0-251: foo: b8 | 253/0x10000-0xffffff: x8{253}, foo: b24 | x8{254}, foo: b64)',  [ 254, 0x00, 0x00, 0x00, 0x00, 0x01, 0xff, 0xff, 0xff ], 9, { foo: 0x01ffffff }, 'write named alternation long')
})
