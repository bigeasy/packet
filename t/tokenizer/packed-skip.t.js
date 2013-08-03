#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('b16{x3,foo:b6,bar:-b7}', [
        { 'signed': false
        , 'endianness': 'b'
        , 'bits': 16
        , 'type': 'n'
        , 'bytes': 2
        , 'exploded': false
        , 'repeat': 1
        , 'packing':
            [
                { 'signed': false
                , 'endianness': 'x'
                , 'bits': 3
                , 'type': 'n'
                , 'bytes': 3
                , 'repeat': 1
                , 'arrayed': false
                , 'exploded': false
                }
            ,
                { 'name': 'foo'
                , 'signed': false
                , 'endianness': 'b'
                , 'bits': 6
                , 'type': 'n'
                , 'bytes': 6
                , 'repeat': 1
                , 'arrayed': false
                , 'exploded': false
                }
            ,
                { 'name': 'bar'
                , 'signed': true
                , 'endianness': 'b'
                , 'bits': 7
                , 'type': 'n'
                , 'bytes': 7
                , 'repeat': 1
                , 'arrayed': false
                , 'exploded': true
                }
            ]
        }
    ], 'parse bit packing starting with skip.')
})
