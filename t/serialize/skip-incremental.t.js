#!/usr/bin/env node

require('./proof')(3, function (serialize) {
    serialize([ 0xaa, 0xaa ], 'x16, b8z|utf8()', 'ABC', [ 1, 5 ], [ 0xaa, 0xaa, 0x41, 0x42, 0x43, 0x00 ], 'write a zero terminated UTF-8 string after skipping');
});
