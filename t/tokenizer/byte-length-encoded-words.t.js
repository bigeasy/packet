#!/usr/bin/env node
require('./proof')(2, function (parseEqual) {
    parseEqual('foo:b8/b16', [
        { signed: false
        , bits: 8
        , endianness: 'b'
        , bytes: 1
        , type: 'n'
        , exploded: false
        , arrayed: false
        , repeat: 1
        , lengthEncoding: true
        }
    ,
        { name: 'foo'
        , signed: false
        , bits: 16
        , endianness: 'b'
        , bytes: 2
        , type: 'n'
        , exploded: false
        , arrayed: true
        , repeat: 1
        }
    ], 'parse a length encoded array of 16 bit numbers.')
    parseEqual('numbers: b8/b16', [
        { signed: false
        , bits: 8
        , endianness: 'b'
        , bytes: 1
        , type: 'n'
        , exploded: false
        , arrayed: false
        , repeat: 1
        , lengthEncoding: true
        }
    ,
        { name: 'numbers'
        , signed: false
        , bits: 16
        , endianness: 'b'
        , bytes: 2
        , type: 'n'
        , exploded: false
        , arrayed: true
        , repeat: 1
        }
    ], 'parse a length encoded array of 16 bit numbers.')
})
