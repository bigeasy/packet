#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('b8{high: b2, x1{0}, low: b2, x3}, x8{0}, foo: b8', [
        { 'signed': false
        , 'endianness': 'b'
        , 'bits': 8
        , 'type': 'n'
        , 'bytes': 1
        , 'exploded': false
        , 'repeat': 1
        , 'packing':
            [
                { 'signed': false
                , 'endianness': 'b'
                , 'bits': 2
                , 'type': 'n'
                , 'bytes': 2
                , 'repeat': 1
                , 'arrayed': false
                , 'exploded': false
                , 'name': 'high'
                }
            ,
                { 'signed': false
                , 'endianness': 'x'
                , 'bits': 1
                , 'type': 'n'
                , 'bytes': 1
                , 'repeat': 1
                , 'arrayed': false
                , 'exploded': false
                , 'padding': 0
                }
            ,
                { 'signed': false
                , 'endianness': 'b'
                , 'bits': 2
                , 'type': 'n'
                , 'bytes': 2
                , 'repeat': 1
                , 'arrayed': false
                , 'exploded': false
                , 'name': 'low'
                }
            ,
                { 'signed': false
                , 'endianness': 'x'
                , 'bits': 3
                , 'type': 'n'
                , 'bytes': 3
                , 'repeat': 1
                , 'arrayed': false
                , 'exploded': false
                }
            ]
        }
    ,
        { signed: false,
            endianness: 'x',
            bits: 8,
            type: 'n',
            bytes: 1,
            exploded: false,
            repeat: 1,
            arrayed: false,
            padding: 0
        }
    ,
        { name: 'foo',
            signed: false,
            endianness: 'b',
            bits: 8,
            type: 'n',
            bytes: 1,
            exploded: false,
            repeat: 1,
            arrayed: false
        }
    ], 'parse a named bit packed pattern.')
})
