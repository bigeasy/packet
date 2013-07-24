#!/usr/bin/env node

require('./proof')(9, function (serialize) {
    serialize('b8(0-251: foo: b8 | 252/252-0xffff: x8{252}, bar: b16 | 253/0x10000-0xffffff: x8{253}, baz: b24 | x8{254}, bob: b64)', 3, 1, [ 0x03 ], 'write alternation byte')
    serialize('b8(0-251: foo: b8 | 252/252-0xffff: x8{252}, bar: b16 | 253/0x10000-0xffffff: x8{253}, baz: b24 | x8{254}, bob: b64)', 258, 3, [ 252, 0x01, 0x02 ], 'write alternation short')
    serialize('b8(252/252-0xffff: x8{252}, foo: b16 | 0-251: foo: b8 | 253/0x10000-0xffffff: x8{253}, foo: b24 | x8{254}, foo: b64)', { foo: 0x01ffffff }, 9, [ 254, 0x00, 0x00, 0x00, 0x00, 0x01, 0xff, 0xff, 0xff ], 'write named alternation long')
})
