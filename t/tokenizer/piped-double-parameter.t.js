#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:b8z|twiddle(' + Number.MAX_VALUE + ')', [
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
                , parameters: [ Number.MAX_VALUE ]
                }
            ]
        }
    ], 'parse a transform with an float parameter.')
})
