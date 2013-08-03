#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:b128', [
        { name: 'foo'
        , signed: false
        , bits: 128
        , endianness: 'b'
        , bytes: 16
        , type: 'a'
        , exploded: true
        , arrayed: false
        , repeat: 1
        }
    ], 'parse a number greater than 64 bits with no type.')
})
