#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:-b16', [
        { name: 'foo'
        , signed: true
        , bits: 16
        , endianness: 'b'
        , bytes: 2
        , type: 'n'
        , exploded: true
        , arrayed: false
        , repeat: 1
        }
    ], 'parse a single signed 16 bit number')
})
