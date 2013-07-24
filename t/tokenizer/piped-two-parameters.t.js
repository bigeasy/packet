#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:b8z|twiddle("utf8", 8)', [
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
                { name: 'twiddle'
                , parameters: [ 'utf8', 8 ],
                }
            ]
        }
    ], 'parse a transform with a two parameters.')
})
