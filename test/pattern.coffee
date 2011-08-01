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
      , exploded: false
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
      , exploded: true
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
      , exploded: false
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
      , exploded: true
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
      , exploded: false
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
      , exploded: false
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
      , exploded: true
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
      , exploded: false
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
      , exploded: true
      , arrayed: false
      , repeat: 1
      }
    ,
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , exploded: false
      , arrayed: false
      , repeat: 1
      }
    ]
    done 1

  'test: parse a multi-line pattern': (done) ->
    try
      field = parse """
        -l16,
        b8
      """
    catch e
      console.log e.stack
    @deepEqual field,
    [
      { signed: true
      , bits: 16
      , endianness: 'l'
      , bytes: 2
      , type: 'n'
      , exploded: true
      , arrayed: false
      , repeat: 1
      }
    ,
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , exploded: false
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
      , exploded: true
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
      , exploded: true
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
      , exploded: true
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
      , exploded: false
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
      , exploded: false
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
      , exploded: false
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
      }
    ]
    done 1

  'test: parse a list of bytes terminated by a custom terminator.': (done) ->
    field = parse('b8z<13,0x0A>')
    @deepEqual field, [
      { signed: false
      , bits: 8
      , endianness: 'b'
      , bytes: 1
      , type: 'n'
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 13, 10 ]
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
      , exploded: false
      , arrayed: true
      , repeat: 8
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: 8
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: 8
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
      , arrayed: true
      , repeat: Number.MAX_VALUE
      , terminator: [ 0 ]
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
      , exploded: false
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
      , "exploded": false
      , "packing":
        [
          { "signed": false
          , "endianness": "b"
          , "bits": 3
          , "type": "n"
          , "bytes": 3
          , "repeat": 1
          , "arrayed": false
          , "exploded": false
          }
        ,
          { "signed": false
          , "endianness": "x"
          , "bits": 6
          , "type": "n"
          , "bytes": 6
          , "repeat": 1
          , "arrayed": false
          , "exploded": false
          }
        ,
          { "signed": true
          , "endianness": "b"
          , "bits": 7
          , "type": "n"
          , "bytes": 7
          , "repeat": 1
          , "arrayed": false
          , "exploded": true
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
      , "exploded": false
      , "packing":
        [
          { "signed": false
          , "endianness": "x"
          , "bits": 3
          , "type": "n"
          , "bytes": 3
          , "repeat": 1
          , "arrayed": false
          , "exploded": false
          }
        ,
          { "signed": false
          , "endianness": "b"
          , "bits": 6
          , "type": "n"
          , "bytes": 6
          , "repeat": 1
          , "arrayed": false
          , "exploded": false
          }
        ,
          { "signed": true
          , "endianness": "b"
          , "bits": 7
          , "type": "n"
          , "bytes": 7
          , "repeat": 1
          , "arrayed": false
          , "exploded": true
          }
        ]
      }
    ]
    done 1

  'test: parse a named bit packed pattern.': (done) ->
    try
      field = parse "b8{b2 => high, x1, b2 => low, x3}"
      expected = [
        { "signed": false
        , "endianness": "b"
        , "bits": 8
        , "type": "n"
        , "bytes": 1
        , "exploded": false
        , "packing":
          [
            { "signed": false
            , "endianness": "b"
            , "bits": 2
            , "type": "n"
            , "bytes": 2
            , "repeat": 1
            , "arrayed": false
            , "exploded": false
            , "name": "high"
            }
          ,
            { "signed": false
            , "endianness": "x"
            , "bits": 1
            , "type": "n"
            , "bytes": 1
            , "repeat": 1
            , "arrayed": false
            , "exploded": false
            }
          ,
            { "signed": false
            , "endianness": "b"
            , "bits": 2
            , "type": "n"
            , "bytes": 2
            , "repeat": 1
            , "arrayed": false
            , "exploded": false
            , "name": "low"
            }
          ,
            { "signed": false
            , "endianness": "x"
            , "bits": 3
            , "type": "n"
            , "bytes": 3
            , "repeat": 1
            , "arrayed": false
            , "exploded": false
            }
          ]
        }
      ]
      @deepEqual field[0].packing[0], expected[0].packing[0]
      @deepEqual field[0].packing[1], expected[0].packing[1]
      @deepEqual field[0].packing[2], expected[0].packing[2]
      @deepEqual field[0].packing[3], expected[0].packing[3]
      @deepEqual field, expected
      done 1
    catch e
      console.log e.stack

  'test: parse alternation with range.': (done) ->
    field = parse "b8(0-251: b8 | 252: x8, b16 | 253: x8, b24 | 254: x8, b64)"
    @deepEqual field, [
      { "signed": false
      , "endianness": "b"
      , "bits": 8
      , "type": "n"
      , "bytes": 1
      , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 16
              , "type": "n"
              , "bytes": 2
              , "exploded": false
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
              , "exploded": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 24
              , "type": "n"
              , "bytes": 3
              , "exploded": false
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
              , "exploded": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 64
              , "type": "n"
              , "bytes": 8
              , "exploded": false
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

  'test: parse alternation with default.': (done) ->
    field = parse "b8(252: x8, b16 | 253: x8, b24 | 254: x8, b64 | b8)"
    expected = [
      { "signed": false
      , "endianness": "b"
      , "bits": 8
      , "type": "n"
      , "bytes": 1
      , "exploded": false
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
              , "exploded": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 16
              , "type": "n"
              , "bytes": 2
              , "exploded": false
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
              , "exploded": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 24
              , "type": "n"
              , "bytes": 3
              , "exploded": false
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
              , "exploded": false
              , "repeat": 1
              , "arrayed": false
              }
            ,
              { "signed": false
              , "endianness": "b"
              , "bits": 64
              , "type": "n"
              , "bytes": 8
              , "exploded": false
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
              , "exploded": false
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
      , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
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
      , "exploded": false
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
              , "exploded": false
              , "packing":
                [
                  { "signed": false
                  , "endianness": "x"
                  , "bits": 1
                  , "type": "n"
                  , "bytes": 1
                  , "repeat": 1
                  , "arrayed": false
                  , "exploded": false
                  }
                ,
                  { "signed": false
                  , "endianness": "b"
                  , "bits": 15
                  , "type": "n"
                  , "bytes": 15
                  , "repeat": 1
                  , "arrayed": false
                  , "exploded": true
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
              , "exploded": false
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
      , "exploded": false
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
              , "exploded": false
              , "packing":
                [
                  { "signed": false
                  , "endianness": "x"
                  , "bits": 1
                  , "type": "n"
                  , "bytes": 1
                  , "repeat": 1
                  , "arrayed": false
                  , "exploded": false
                  }
                ,
                  { "signed": false
                  , "endianness": "b"
                  , "bits": 15
                  , "type": "n"
                  , "bytes": 15
                  , "repeat": 1
                  , "arrayed": false
                  , "exploded": true
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
              , "exploded": false
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
              , "exploded": false
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
              , "exploded": false
              , "packing":
                [
                  { "signed": false
                  , "endianness": "x"
                  , "bits": 1
                  , "type": "n"
                  , "bytes": 1
                  , "repeat": 1
                  , "arrayed": false
                  , "exploded": false
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
                  , "exploded": true
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
    @trap "invalid pattern at character 1", -> parse("blurdy")
    done 1

  'test: parse a 7 bit pattern.': (done) ->
    @trap "bit size must be divisible by 8 at character 2", -> parse("b7")
    done 1

  'test: parse a bad multi-line pattern.': (done) ->
    @trap "bit size must be divisible by 8 at line 2 character 2", -> parse("b8,\nb7")
    done 1

  'test: parse a 0 bit pattern.': (done) ->
    @trap "bit size must be non-zero at character 2", -> parse("b0")
    done 1

  'test: parse a float pattern other than 32 or 64 bits.': (done) ->
    @trap "floats can only be 32 or 64 bits at character 2", -> parse('b16f')
    done 1

  'test: parse two patterns together without a comma.': (done) ->
    @trap "invalid pattern at character 4", -> parse('l16b8')
    done 1

  'test: parse a little-endian integer packed in an integer.': (done) ->
    @trap "invalid pattern at character 3", -> parse('b8{l4,b4}')
    done 1

  'test: parse invalid bit pattern.': (done) ->
    @trap "invalid pattern at character 13", -> parse("b16{b3,x6,b7f}")
    done 1

  'test: parse invalid alternation number pattern.': (done) ->
    @trap "invalid number at character 4", -> parse("b8(Q: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
    done 1

  'test: parse invalid alternation range with mask lower.': (done) ->
    @trap "masks not permitted in ranges at character 6", -> parse("b8(0-&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
    done 1

  'test: parse invalid alternation range with mask higher.': (done) ->
    @trap "masks not permitted in ranges at character 4", -> parse("b8(&0x01-&0x80: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
    done 1

  'test: parse invalid alternation range with any.': (done) ->
    @trap "any not permitted in ranges at character 6", -> parse("b8(0-*: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
    done 1

  'test: parse invalid alternation range with junk before colon.': (done) ->
    @trap "invalid pattern at character 9", -> parse("b8(&0x80Steve: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
    done 1

  'test: parse invalid alternation range with junk before colon.': (done) ->
    @trap "field alternates not allowed at character 9", -> parse("b8(&0x80/0-0x7f: b16{x1,b15} | b8)/(0-0x7f: b8 | b16{x1{1},b15})")
    done 1

  'test: parse bit packed pattern underflow.': (done) ->
    @trap "bit pack pattern underflow at character 5", -> parse("b16{b3,x6,b6}")
    done 1

  'test: parse bit packed pattern overflow.': (done) ->
    @trap "bit pack pattern overflow at character 5", -> parse("b16{b3,x6,b8}")
    done 1

  'test: parse terminator out of range.': (done) ->
    @trap "terminator value out of range at character 5", -> parse("b8z<300>")
    done 1

  'test: parse bad terminator.': (done) ->
    @trap "invalid terminator at character 10", -> parse("b8z<0x0A,a>")
    done 1

  'test: parse bad terminator.': (done) ->
    @trap "invalid terminator at character 10", -> parse("b8z<0x0A,a>")
    done 1

  'test: error index after pipeline.': (done) ->
    @trap "invalid pattern at character 24", -> parse("b8z|twiddle(8, 'utf8'),z")
    done 1

  'test: error index after named pattern.': (done) ->
    @trap "invalid pattern at character 14", -> parse("b8z => steve,z")
    done 1

  'test: error index after terminator.': (done) ->
    @trap "invalid pattern at character 18", -> parse("b8z< 10 , 13 > , z")
    done 1

  'test: error index after padding.': (done) ->
    @trap "invalid pattern at character 14", -> parse("b8{ 0x00 } , z")
    done 1

  'test: error index after length encoding.': (done) ->
    @trap "invalid pattern at character 9", -> parse("b16/b8, z")
    done 1

  'test: error array length is zero.': (done) ->
    @trap "array length must be non-zero at character 4", -> parse("b8[0]")
    done 1
