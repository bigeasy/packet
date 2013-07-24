#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual("foo:b8z|twiddle('a \\u00DF b \\' c')", [
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
                , parameters: [ "a \u00DF b ' c" ],
                }
            ]
        }
    ], 'parse a transform with a single quoted string parameter.')
})
