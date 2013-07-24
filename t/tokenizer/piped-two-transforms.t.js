#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo: b8z|utf8()|atoi(8)', [
        { name: 'foo'
        , signed: false
        , bits: 8
        , endianness: 'b'
        , bytes: 1
        , type: 'n'
        , exploded: false
        , arrayed: true
        , repeat: Number.MAX_VALUE
        , terminator: [ 0 ]
        , pipeline:
            [
                { name: 'utf8'
                , parameters: []
                }
                ,
                { name: 'atoi'
                , parameters: [ 8 ]
                }
            ]
        }
    ], 'parse a two transforms in a row.')
})
