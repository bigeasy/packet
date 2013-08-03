#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:b64f', [
        { name: 'foo'
        , signed: false
        , bits: 64
        , endianness: 'b'
        , bytes: 8
        , type: 'f'
        , exploded: true
        , arrayed: false
        , repeat: 1
        }
    ], 'parse a single 64 bit float.')
})
