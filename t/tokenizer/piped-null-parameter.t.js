#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:b8z|twiddle(null)', [
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
                , parameters: [ null ],
                }
            ]
        }
    ], 'parse a transform with a null parameter.')
})
