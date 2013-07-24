#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('foo:b8z|str("utf8"), bar:b16', [
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
                { name: 'str'
                , parameters: [ 'utf8' ]
                }
            ]
        }
    ,
        { name: 'bar'
        , signed: false
        , bits: 16
        , endianness: 'b'
        , bytes: 2
        , type: 'n'
        , exploded: false
        , arrayed: false
        , repeat: 1
        }
    ], 'parse a transform followed by a 16 bit number.')
})
