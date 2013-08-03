#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('b8( &0x80: b16{x1, foo: b15} |  foo: b8 )', [
        { 'signed': false
        , 'endianness': 'b'
        , 'bits': 8
        , 'type': 'n'
        , 'bytes': 1
        , 'exploded': false
        , 'arrayed': true
        , 'alternation':
            [
                { 'read':
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
                    , 'mask': 128
                    }
                , 'write':
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
                    , 'mask': 128
                    }
                , 'pattern':
                    [
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
                                , 'bits': 1
                                , 'type': 'n'
                                , 'bytes': 1
                                , 'repeat': 1
                                , 'arrayed': false
                                , 'exploded': false
                                }
                            ,
                                { 'name': 'foo'
                                , 'signed': false
                                , 'endianness': 'b'
                                , 'bits': 15
                                , 'type': 'n'
                                , 'bytes': 15
                                , 'repeat': 1
                                , 'arrayed': false
                                , 'exploded': true
                                }
                            ]
                        }
                    ]
                }
            ,
                { 'read':
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
                    , 'mask': 0
                    }
                , 'pattern':
                    [
                        { 'name': 'foo'
                        , 'signed': false
                        , 'endianness': 'b'
                        , 'bits': 8
                        , 'type': 'n'
                        , 'bytes': 1
                        , 'exploded': false
                        , 'repeat': 1
                        , 'arrayed': false
                        }
                    ]
                }
            ,
                { 'read':
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
                    , 'mask': 0
                    }
                , 'failed': true
                }
            ]
        }
    ], 'parse alternation with bit mask.')
})
