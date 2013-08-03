#!/usr/bin/env node
require('./proof')(3, function (serialize) {
    serialize({ require: true },
              'foo: b8z|utf8()', { foo: 'ABC' }, 4, [ 0x41, 0x42, 0x43, 0x00 ],
              'write a zero terminated UTF-8 string')
})
