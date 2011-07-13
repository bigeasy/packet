{TwerpTest} = require "twerp"
{parse}     = require "pattern"

class exports.PacketTest extends TwerpTest
  trap: (message, callback) ->
    try
      callback()
    catch e
      @equal e.message, message

  'test: parse a single byte': (done) ->
    field = parse('b8')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single signed byte': (done) ->
    field = parse('-b8')
    @deepEqual field, [
      { signed: true
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: true
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single 16 bit number': (done) ->
    field = parse('b16')
    @deepEqual field, [
      { signed: false
      , bits: 16
      , endianness: 'b'
      , bytes: 2
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single signed 16 bit number': (done) ->
    field = parse('-b16')
    @deepEqual field, [
      { signed: true
      , bits: 16
      , endianness: 'b'
      , bytes: 2
      , type: 'n'
      , unpacked: true
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single big-endian 16 bit number': (done) ->
    field = parse('b16')
    @deepEqual field, [
      { signed: false
      , bits: 16
      , endianness: 'b'
      , bytes: 2
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single little-endian 16 bit number': (done) ->
    field = parse('l16')
    @deepEqual field, [
      { signed: false
      , bits: 16
      , endianness: 'l'
      , bytes: 2
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single signed little-endian 16 bit number': (done) ->
    field = parse('-l16')
    @deepEqual field, [
      { signed: true
      , bits: 16
      , endianness: 'l'
      , bytes: 2
      , type: 'n'
      , unpacked: true
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single 16 bit skip': (done) ->
    field = parse('x16')
    @deepEqual field, [
      { signed: false
      , bits: 16
      , endianness: 'x'
      , bytes: 2
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a signed little-endian 16 bit number followed by a byte': (done) ->
    field = parse('-l16, b8')
    @deepEqual field,
    [
      { signed: true
      , bits: 16
      , endianness: 'l'
      , bytes: 2
      , type: 'n'
      , unpacked: true
      , arrayed: false
      , repeat: 1
      }
    ,
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a number greater than 64 bits with no type.': (done) ->
    field =  parse('b128')
    @deepEqual field, [
      { signed: false
      , bits: 128
      , endianness: 'b'
      , bytes: 16
      , type: 'a'
      , unpacked: true
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single 32 bit float.': (done) ->
    field = parse('b32f')
    @deepEqual field, [
      { signed: true
      , bits: 32
      , endianness: 'b'
      , bytes: 4
      , type: 'f'
      , unpacked: true
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a single 64 bit float.': (done) ->
    field = parse('b64f')
    @deepEqual field, [
      { signed: true
      , bits: 64
      , endianness: 'b'
      , bytes: 8
      , type: 'f'
      , unpacked: true
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse an array of 8 bytes.': (done) ->
    field = parse('b8[8]')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: 8
      }
    ]
    done 1

  'test: parse a length encoded array of 16 bit numbers.': (done) ->
    field = parse('b8/b16')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      , lengthEncoding: true
      }
    ,
      { signed: false
      , bits: 16
      , endianness: 'b'
      , bytes: 2
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: 1
      }
    ]
    done 1

  'test: parse a list of bytes terminated by zero.': (done) ->
    field = parse('b8z')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      }
    ]
    done 1

  'test: parse a zero terminated array of 8 bytes zero filled.': (done) ->
    field = parse('b8[8]{0}z')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: 8
      , terminator: "\0"
      , padding: 0
      }
    ]
    done 1

  'test: parse a zero terminated array of 8 bytes 0x10 filled.': (done) ->
    field = parse('b8[8]{0x10}z')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: 8
      , terminator: "\0"
      , padding: 16
      }
    ]
    done 1

  'test: parse a zero terminated array of 8 bytes 010 filled.': (done) ->
    field = parse('b8[8]{010}z')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: 8
      , terminator: "\0"
      , padding: 8
      }
    ]
    done 1

  'test: parse an list of bytes termianted by zero piped to a transform.': (done) ->
    field = parse('b8z|str()')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "str"
          , parameters: []
          }
        ]
      }
    ]
    done 1

  'test: parse a transform a with a single parameter.': (done) ->
    field = parse('b8z|str("utf8")')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "str"
          , parameters: [ "utf8" ]
          }
        ]
      }
    ]
    done 1

  'test: parse a transform followed by a 16 bit number.': (done) ->
    field = parse('b8z|str("utf8"), b16')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "str"
          , parameters: [ "utf8" ]
          }
        ]
      }
    ,
      { signed: false
      , bits: 16
      , endianness: 'b'
      , bytes: 2
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a transform with an integer parameter.': (done) ->
    field = parse('b8z|twiddle(8)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ 8 ]
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a negative integer parameter.': (done) ->
    field = parse('b8z|twiddle(-8)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ -8 ]
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with an float parameter.': (done) ->
    field = parse('b8z|twiddle(' + Number.MAX_VALUE + ')')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ Number.MAX_VALUE ]
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a negative float parameter.': (done) ->
    field = parse('b8z|twiddle(' + Number.MIN_VALUE + ')')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ Number.MIN_VALUE ]
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a null parameter.': (done) ->
    field = parse('b8z|twiddle(null)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ null ],
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a true parameter.': (done) ->
    field = parse('b8z|twiddle(true)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ true ],
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a false parameter.': (done) ->
    field = parse('b8z|twiddle(false)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ false ],
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a single quoted string parameter.': (done) ->
    field = parse("b8z|twiddle('test: parse a \\u00DF b \\' c')")
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ "a \u00DF b \" c" ],
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a single quoted string parameter.': (done) ->
    field = parse('b8z|twiddle("a \\u00DF b \\" c")')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ "a \u00DF b \" c" ],
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with a two parameters.': (done) ->
    field = parse('b8z|twiddle("utf8", 8)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ "utf8", 8 ],
          }
        ]
      }
    ]
    done 1

  'test: parse a transform with many parameters.': (done) ->
    field = parse('b8z|twiddle("utf8", 8, 8.1, false)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "twiddle"
          , parameters: [ "utf8", 8, 8.1, false ],
          }
        ]
      }
    ]
    done 1

  'test: parse a two transforms in a row.': (done) ->
    field = parse('b8z|utf8()|atoi(8)')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "utf8"
          , parameters: []
          }
          ,
          { name: "atoi"
          , parameters: [ 8 ]
          }
        ]
      }
    ]
    done 1

  'test: parse a named element.': (done) ->
    field = parse('b8z|utf8()|atoi(8) => mode, b32 => length')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , name: "mode"
      , unpacked: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: "\0"
      , pipeline:
        [
          { name: "utf8"
          , parameters: []
          }
          ,
          { name: "atoi"
          , parameters: [ 8 ]
          }
        ]
      },
      { signed: false
      , endianness: 'b'
      , bits: 32
      , bytes: 4
      , type: 'n'
      , unpacked: false
      , arrayed: false
      , repeat: 1
      , name: "length"
      }
    ]
    done 1

  'test: parse bit packing starting with big-endian.': (done) ->
    field = parse("b16{b3,x6,-b7}")
    expected = [
      { "signed": false
      , "endianness": "b"
      , "bits": 16
      , "type": "n"
      , "bytes": 2
      , "unpacked": false
      , "packing":
        [
          { "signed": false
          , "endianness": "b"
          , "bits": 3
          , "type": "n"
          , "bytes": 3
          , "repeat": 1
          , "arrayed": false
          , "unpacked": false
          }
        ,
          { "signed": false
          , "endianness": "x"
          , "bits": 6
          , "type": "n"
          , "bytes": 6
          , "repeat": 1
          , "arrayed": false
          , "unpacked": false
          }
        ,
          { "signed": true
          , "endianness": "b"
          , "bits": 7
          , "type": "n"
          , "bytes": 7
          , "repeat": 1
          , "arrayed": false
          , "unpacked": true
          }
        ]
      }
    ]
    @deepEqual field[0].packing[0], expected[0].packing[0]
    @deepEqual field[0].packing[1], expected[0].packing[1]
    @deepEqual field[0].packing[2], expected[0].packing[2]
    @deepEqual field, expected
    done 1

  'test: parse bit packing starting with skip.': (done) ->
    field = parse("b16{x3,b6,-b7}")
    @deepEqual field, [
      { "signed": false
      , "endianness": "b"
      , "bits": 16
      , "type": "n"
      , "bytes": 2
      , "unpacked": false
      , "packing":
        [
          { "signed": false
          , "endianness": "x"
          , "bits": 3
          , "type": "n"
          , "bytes": 3
          , "repeat": 1
          , "arrayed": false
          , "unpacked": false
          }
        ,
          { "signed": false
          , "endianness": "b"
          , "bits": 6
          , "type": "n"
          , "bytes": 6
          , "repeat": 1
          , "arrayed": false
          , "unpacked": false
          }
        ,
          { "signed": true
          , "endianness": "b"
          , "bits": 7
          , "type": "n"
          , "bytes": 7
          , "repeat": 1
          , "arrayed": false
          , "unpacked": true
          }
        ]
      }
    ]
    done 1

  'test: parse alternation with range.': (done) ->
    try
      field = parse "b8(0-251: b8 | 252: x8, b16 | 253: x8, b24 | 254: x8, b64)"
      @deepEqual field, [
        { "signed": false
        , "endianness": "b"
        , "bits": 8
        , "type": "n"
        , "bytes": 1
        , "unpacked": false
        , "arrayed": true
        , "alternation":
          [
            { "read":
              { "maximum": 251
              , "minimum": 0
              , "mask": 0
              }
            , "write":
              { "maximum": 251
              , "minimum": 0
              , "mask": 0
              }
            , "pattern":
              [
                { "signed": false
                , "endianness": "b"
                , "bits": 8
                , "type": "n"
                , "bytes": 1
                , "unpacked": false
                , "repeat": 1
                , "arrayed": false
                }
              ]
            }
          ,
            { "read":
              { "minimum": 252
              , "maximum": 252
              , "mask": 0
              }
            , "write":
              { "minimum": 252
              , "maximum": 252
              , "mask": 0
              }
            , "pattern":
              [
                { "signed": false
                , "endianness": "x"
                , "bits": 8
                , "type": "n"
                , "bytes": 1
                , "unpacked": false
                , "repeat": 1
                , "arrayed": false
                }
              ,
                { "signed": false
                , "endianness": "b"
                , "bits": 16
                , "type": "n"
                , "bytes": 2
                , "unpacked": false
                , "repeat": 1
                , "arrayed": false
                }
              ]
            }
          ,
            { "read":
              { "minimum": 253
              , "maximum": 253
              , "mask": 0
              }
            , "write":
              { "minimum": 253
              , "maximum": 253
              , "mask": 0
              }
            , "pattern":
              [
                { "signed": false
                , "endianness": "x"
                , "bits": 8
                , "type": "n"
                , "bytes": 1
                , "unpacked": false
                , "repeat": 1
                , "arrayed": false
                }
              ,
                { "signed": false
                , "endianness": "b"
                , "bits": 24
                , "type": "n"
                , "bytes": 3
                , "unpacked": false
                , "repeat": 1
                , "arrayed": false
                }
              ]
            }
          ,
            { "read":
              { "minimum": 254
              , "maximum": 254
              , "mask": 0
              }
            , "write":
              { "minimum": 254
              , "maximum": 254
              , "mask": 0
              }
            , "pattern":
              [
                { "signed": false
                , "endianness": "x"
                , "bits": 8
                , "type": "n"
                , "bytes": 1
                , "unpacked": false
                , "repeat": 1
                , "arrayed": false
                }
              ,
                { "signed": false
                , "endianness": "b"
                , "bits": 64
                , "type": "n"
                , "bytes": 8
                , "unpacked": false
                , "repeat": 1
                , "arrayed": false
                }
              ]
            }
          ,
            { "read":
              { "minimum": Number.MIN_VALUE
              , "maximum": Number.MAX_VALUE
              , "mask": 0
              }
            , "write":
              { "minimum": Number.MIN_VALUE
              , "maximum": Number.MAX_VALUE
              , "mask": 0
              }
            , "failed": true
            }
          ]
        }
      ]
      done 1
    catch e
      console.log e.stack

  'test: parse alternation with default.': (done) ->
    field = parse "b8(252: x8, b16 | 253: x8, b24 | 254: x8, b64 | b8)"
    expected = [
      { "signed": false
      , "endianness": "b"
      , "bits": 8
      , "type": "n"
      , "bytes": 1
      , "unpacked": false
      , "arrayed": true
      , "alternation":
        [
          { "read":
            { "minimum": 252
            , "maximum": 252
            , "mask": 0
            }
          , "write":
            { "minimum": 252
            , "maximum": 252
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "x"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 16
              , "type": "n"
              , "bytes": 2
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": 253
            , "maximum": 253
            , "mask": 0
            }
          , "write":
            { "minimum": 253
            , "maximum": 253
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "x"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 24
              , "type": "n"
              , "bytes": 3
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": 254
            , "maximum": 254
            , "mask": 0
            }
          , "write":
            { "minimum": 254
            , "maximum": 254
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "x"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 64
              , "type": "n"
              , "bytes": 8
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "failed": true
          }
        ]
      }
    ]
    @deepEqual field, expected
    done 1

  'test: parse alternation with reads and writes.': (done) ->
    try
      field = parse "b8(0-251: b8 | 252/252-0xffff: x8{252}, b16 | 253/0x10000-0xffffff: x8{253}, b24 | 254/*: x8{254}, b64)"
    catch e
      console.log e.stack
    expected = [
      { "signed": false
      , "endianness": "b"
      , "bits": 8
      , "type": "n"
      , "bytes": 1
      , "unpacked": false
      , "arrayed": true
      , "alternation":
        [
          { "read":
            { "minimum": 0
            , "maximum": 251
            , "mask": 0
            }
          , "write":
            { "minimum": 0
            , "maximum": 251
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": 252
            , "maximum": 252
            , "mask": 0
            }
          , "write":
            { "minimum": 252
            , "maximum": 0xffff
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "x"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              , "padding": 252
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 16
              , "type": "n"
              , "bytes": 2
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": 253
            , "maximum": 253
            , "mask": 0
            }
          , "write":
            { "minimum": 0x10000
            , "maximum": 0xffffff
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "x"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              , "padding": 253
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 24
              , "type": "n"
              , "bytes": 3
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": 254
            , "maximum": 254
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "x"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              , "padding": 254
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 64
              , "type": "n"
              , "bytes": 8
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "failed": true
          }
        ]
      }
    ]
    @deepEqual field[0].alternation[0], expected[0].alternation[0]
    @deepEqual field[0].alternation[1], expected[0].alternation[1]
    @deepEqual field[0].alternation[2], expected[0].alternation[2]
    @deepEqual field[0].alternation[3], expected[0].alternation[3]
    @deepEqual field[0].alternation[4], expected[0].alternation[4]
    @deepEqual field, expected
    done 6

  'test: parse alternation with bit mask.': (done) ->
    field = parse "b8(&0x80: b16{x1,b15} | b8)"
    expected = [
      { "signed": false
      , "endianness": "b"
      , "bits": 8
      , "type": "n"
      , "bytes": 1
      , "unpacked": false
      , "arrayed": true
      , "alternation":
        [
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 128
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 128
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 16
              , "type": "n"
              , "bytes": 2
              , "unpacked": false
              , "packing":
                [
                  { "signed": false
                  , "endianness": "x"
                  , "bits": 1
                  , "type": "n"
                  , "bytes": 1
                  , "repeat": 1
                  , "arrayed": false
                  , "unpacked": false
                  }
                ,
                  { "signed": false
                  , "endianness": "b"
                  , "bits": 15
                  , "type": "n"
                  , "bytes": 15
                  , "repeat": 1
                  , "arrayed": false
                  , "unpacked": true
                  }
                ]
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "failed": true
          }
        ]
      }
    ]
    @deepEqual field[0].alternation[0].pattern[0].packing[0], expected[0].alternation[0].pattern[0].packing[0]
    @deepEqual field[0].alternation[0].pattern[0].packing[1], expected[0].alternation[0].pattern[0].packing[1]
    @deepEqual field, expected
    done 1

  'test: parse alternation with full write alternate.': (done) ->
    field = parse "b8(&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})"
    expected = [
      { "signed": false
      , "endianness": "b"
      , "bits": 8
      , "type": "n"
      , "bytes": 1
      , "unpacked": false
      , "arrayed": true
      , "alternation":
        [
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 128
            }
          , "write":
            { "minimum": Number.MAX_VALUE
            , "maximum": Number.MIN_VALUE
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 16
              , "type": "n"
              , "bytes": 2
              , "unpacked": false
              , "packing":
                [
                  { "signed": false
                  , "endianness": "x"
                  , "bits": 1
                  , "type": "n"
                  , "bytes": 1
                  , "repeat": 1
                  , "arrayed": false
                  , "unpacked": false
                  }
                ,
                  { "signed": false
                  , "endianness": "b"
                  , "bits": 15
                  , "type": "n"
                  , "bytes": 15
                  , "repeat": 1
                  , "arrayed": false
                  , "unpacked": true
                  }
                ]
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MAX_VALUE
            , "maximum": Number.MIN_VALUE
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MAX_VALUE
            , "maximum": Number.MIN_VALUE
            }
          , "write":
            { "minimum": 0
            , "maximum": 127
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 8
              , "type": "n"
              , "bytes": 1
              , "unpacked": false
              , "repeat": 1
              , "arrayed": false
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MAX_VALUE
            , "maximum": Number.MIN_VALUE
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "pattern":
            [
              { "signed": false
              , "endianness": "b"
              , "bits": 16
              , "type": "n"
              , "bytes": 2
              , "unpacked": false
              , "packing":
                [
                  { "signed": false
                  , "endianness": "x"
                  , "bits": 1
                  , "type": "n"
                  , "bytes": 1
                  , "repeat": 1
                  , "arrayed": false
                  , "unpacked": false
                  , "padding": 1
                  }
                ,
                  { "signed": false
                  , "endianness": "b"
                  , "bits": 15
                  , "type": "n"
                  , "bytes": 15
                  , "repeat": 1
                  , "arrayed": false
                  , "unpacked": true
                  }
                ]
              }
            ]
          }
        ,
          { "read":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "write":
            { "minimum": Number.MIN_VALUE
            , "maximum": Number.MAX_VALUE
            , "mask": 0
            }
          , "failed": true
          }
        ]
      }
    ]
    @deepEqual field[0].alternation[0].pattern[0].packing[0], expected[0].alternation[0].pattern[0].packing[0]
    @deepEqual field[0].alternation[0].pattern[0].packing[1], expected[0].alternation[0].pattern[0].packing[1]
    @deepEqual field[0].alternation[0], expected[0].alternation[0]
    @deepEqual field[0].alternation[1], expected[0].alternation[1]
    @deepEqual field[0].alternation[2], expected[0].alternation[2]
    @deepEqual field[0].alternation[3], expected[0].alternation[3]
    @deepEqual field, expected
    done 1

  'test: parse utter nonsense.': (done) ->
    @trap "invalid pattern at index 0", -> parse("blurdy")
    done 1

  'test: parse a 7 bit pattern.': (done) ->
    @trap "bit size must be divisible by 8 at index 1", -> parse("b7")
    done 1

  'test: parse a 0 bit pattern.': (done) ->
    @trap "bit size must be non-zero at index 1", -> parse("b0")
    done 1

  'test: parse a float pattern other than 32 or 64 bits.': (done) ->
    @trap "floats can only be 32 or 64 bits at index 1", -> parse('b16f')
    done 1

  'test: parse two patterns together without a comma.': (done) ->
    @trap "invalid pattern at index 3", -> parse('l16b8')
    done 1

  'test: parse a little-endian integer packed in an integer.': (done) ->
    @trap "invalid pattern at index 2", -> parse('b8{l4,b4}')
    done 1

  'test: parse invalid bit pattern.': (done) ->
    @trap "invalid pattern at index 12", -> parse("b16{b3,x6,b7f}")
    done 1
