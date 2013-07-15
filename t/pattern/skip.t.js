#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('x16', [
        { signed: false
        , bits: 16
        , endianness: 'x'
        , bytes: 2
        , type: 'n'
        , exploded: false
        , arrayed: false
        , repeat: 1
        }
    ], 'parse a single 16 bit skip')
})
