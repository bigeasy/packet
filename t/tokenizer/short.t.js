#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:b16', [
        { name: 'foo'
        , signed: false
        , bits: 16
        , endianness: 'b'
        , bytes: 2
        , type: 'n'
        , exploded: false
        , arrayed: false
        , repeat: 1
        }
    ], 'parse a single 16 bit number')
})
