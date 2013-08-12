#!/usr/bin/env node

require('./proof')(0, function (serialize) {
    serialize('b8(&0x80: b16{x1, foo: b15} | foo: b8)/(0-0x7f: foo: b8 | b16{x1{1}, foo: b15})', { foo: 3 } , 1, [ 0x03 ], 'write full named write alternation byte')
    serialize('b8(&0x80: b16{x1, foo: b15} | foo: b8)/(0-0x7f: foo: b8 | b16{x1{1}, foo: b15})', { foo: 258 }, 2, [ 0x81, 0x02 ], 'write full named write alternation short')
})
