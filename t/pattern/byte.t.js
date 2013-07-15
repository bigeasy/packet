#!/usr/bin/env node

require('./proof')(1, function (parseEqual) {
    parseEqual('byte: b8', [
        { name: 'byte'
        , signed: false
        , bits: 8
        , endianness: 'b'
        , bytes: 1
        , type: 'n'
        , exploded: false
        , arrayed: false
        , repeat: 1
        }
    ], 'parse a single byte')
})
