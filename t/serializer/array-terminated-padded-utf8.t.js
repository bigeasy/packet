#!/usr/bin/env node
require('./proof')(12, function (serialize) {
    serialize('foo: b8[8]{1}z|utf8()', { foo: 'ABC' }, 8, [ 0x41, 0x42, 0x43, 0x00, 0x01, 0x01, 0x01, 0x01 ],
        'write a zero terminated 8 byte padded UTF-8 string')
    serialize('foo: b8[8]{0}z|utf8()', { foo: '0000ABC' }, 8, [ 0x30, 0x30, 0x30, 0x30, 0x41, 0x42, 0x43, 0x00 ],
        'write a zero terminated 8 byte padded UTF-8 string that is 7 characters long')
    serialize({ require: true },
              'foo: b8z|utf8()|atoi(10)', { foo: '42' }, 3, [ 0x34, 0x32, 0x00 ],
              'write an integer converted to a zero terminated UTF-8 string')
    serialize('foo: b8z|utf8()|pad("0", 7)|atoi(10)', { foo: '42' }, 8, [ 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x32, 0x00 ],
        'write an integer converted to a zero padded zero terminated UTF-8 string')
})
