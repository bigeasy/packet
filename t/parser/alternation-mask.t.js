#!/usr/bin/env node
require('./proof')(0, function (parseEqual) {
    parseEqual({ require: true }, 'b8(&0x80: b16{x1,foo:b15} | bar:b8)', [ 0x81, 0x00 ], 2, {foo:256}, 'read a masked alternative')
    parseEqual({ require: true }, 'b8(&0x80: b16{x1,foo:b15} | bar:b8)/(0-0x7f: baz:b8 | b16{x1{1},bob:b15})', [ 0x03 ], 1, {bar:3}, 'write full write alternation byte')
})
