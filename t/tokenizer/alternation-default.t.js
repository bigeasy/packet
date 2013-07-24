#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('b8(252: x8, foo: b16| 253: x8, foo: b24 | 254: x8, foo: b64| foo: b8)', [
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
                    { 'minimum': 252
                    , 'maximum': 252
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': 252
                    , 'maximum': 252
                    , 'mask': 0
                    }
                , 'pattern':
                    [
                        { 'signed': false
                        , 'endianness': 'x'
                        , 'bits': 8
                        , 'type': 'n'
                        , 'bytes': 1
                        , 'exploded': false
                        , 'repeat': 1
                        , 'arrayed': false
                        }
                    ,
                        { 'name': 'foo'
                        , 'signed': false
                        , 'endianness': 'b'
                        , 'bits': 16
                        , 'type': 'n'
                        , 'bytes': 2
                        , 'exploded': false
                        , 'repeat': 1
                        , 'arrayed': false
                        }
                    ]
                }
            ,
                { 'read':
                    { 'minimum': 253
                    , 'maximum': 253
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': 253
                    , 'maximum': 253
                    , 'mask': 0
                    }
                , 'pattern':
                    [
                        { 'signed': false
                        , 'endianness': 'x'
                        , 'bits': 8
                        , 'type': 'n'
                        , 'bytes': 1
                        , 'exploded': false
                        , 'repeat': 1
                        , 'arrayed': false
                        }
                    ,
                        { 'name': 'foo'
                        , 'signed': false
                        , 'endianness': 'b'
                        , 'bits': 24
                        , 'type': 'n'
                        , 'bytes': 3
                        , 'exploded': false
                        , 'repeat': 1
                        , 'arrayed': false
                        }
                    ]
                }
            ,
                { 'read':
                    { 'minimum': 254
                    , 'maximum': 254
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': 254
                    , 'maximum': 254
                    , 'mask': 0
                    }
                , 'pattern':
                    [
                        { 'signed': false
                        , 'endianness': 'x'
                        , 'bits': 8
                        , 'type': 'n'
                        , 'bytes': 1
                        , 'exploded': false
                        , 'repeat': 1
                        , 'arrayed': false
                        }
                    ,
                        { 'name': 'foo'
                        , 'signed': false
                        , 'endianness': 'b'
                        , 'bits': 64
                        , 'type': 'n'
                        , 'bytes': 8
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
    ], 'parse alternation with default.')
})
