#!/usr/bin/env node
require('./proof')(1, function (parseEqual) {
    parseEqual('b8(0-251: foo:b8 | 252/252-0xffff: x8{252}, foo:b16 | 253/0x10000-0xffffff: x8{253}, foo:b24 | x8{254}, foo:b64)', [
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
                    { 'minimum': 0
                    , 'maximum': 251
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': 0
                    , 'maximum': 251
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
                    { 'minimum': 252
                    , 'maximum': 252
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': 252
                    , 'maximum': 0xffff
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
                        , 'padding': 252
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
                    { 'minimum': 0x10000
                    , 'maximum': 0xffffff
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
                        , 'padding': 253
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
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
                    , 'mask': 0
                    , 'mask': 0
                    }
                , 'write':
                    { 'minimum': -Number.MAX_VALUE
                    , 'maximum': Number.MAX_VALUE
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
                        , 'padding': 254
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
                , 'failed': true
                }
            ]
        }
    ], 'parse alternation with reads and writes.')
})
