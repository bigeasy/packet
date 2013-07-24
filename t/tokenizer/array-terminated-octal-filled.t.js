#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo: b8[8]{010}z', [
        { name: 'foo'
        , signed: false
        , bits: 8
        , endianness: 'b'
        , bytes: 1
        , type: 'n'
        , exploded: false
        , arrayed: true
        , repeat: 8
        , terminator: [ 0 ]
        , padding: 8
        }
    ], 'parse a zero terminated array of 8 bytes 010 filled.')
})
