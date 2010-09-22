var vows = require('vows'),
    assert = require('assert'); 

vows.describe('Pattern').addBatch({
    'Pattern provides': {
        topic: require('pattern'),
        'the parse method': function (topic) {
          assert.isFunction(topic.parse);
        }
    },
    'Pattern can parse a pattern that describes': {
        topic: require('pattern'),
        'a single byte': function (topic) {
            var field = topic.parse('b8');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single signed byte': function (topic) {
            var field = topic.parse('-b8');
            assert.deepEqual(field, [
                { signed: true
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: true
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single 16 bit number': function (topic) {
            var field = topic.parse('b16');
            assert.deepEqual(field, [
                { signed: false
                , bits: 16
                , endianness: 'b'
                , bytes: 2
                , type: 'n'
                , unpacked: false
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single signed 16 bit number': function (topic) {
            var field = topic.parse('-b16');
            assert.deepEqual(field, [
                { signed: true
                , bits: 16
                , endianness: 'b'
                , bytes: 2
                , type: 'n'
                , unpacked: true
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single big-endian 16 bit number': function (topic) {
            var field = topic.parse('b16');
            assert.deepEqual(field, [
                { signed: false
                , bits: 16
                , endianness: 'b'
                , bytes: 2
                , type: 'n'
                , unpacked: false
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single little-endian 16 bit number': function (topic) {
            var field = topic.parse('l16');
            assert.deepEqual(field, [
                { signed: false
                , bits: 16
                , endianness: 'l'
                , bytes: 2
                , type: 'n'
                , unpacked: false
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single signed little-endian 16 bit number': function (topic) {
            var field = topic.parse('-l16');
            assert.deepEqual(field, [
              { signed: true
              , bits: 16
              , endianness: 'l'
              , bytes: 2
              , type: 'n'
              , unpacked: true
              , arrayed: false
              , repeat: 1
              }
            ]);
        },
        'a single 16 bit skip': function (topic) {
            var field = topic.parse('x16');
            assert.deepEqual(field, [
                { signed: false
                , bits: 16
                , endianness: 'x'
                , bytes: 2
                , type: 'n'
                , unpacked: false
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a signed little-endian 16 bit number followed by a byte': function (topic) {
            var field = topic.parse('-l16b8');
            assert.deepEqual(field,
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
            ]);
        },
        'a number greater than 64 bits with no type.': function (topic) {
            var field =  topic.parse('b128');
            assert.deepEqual(field, [
                { signed: false
                , bits: 128
                , endianness: 'b'
                , bytes: 16
                , type: 'a'
                , unpacked: true
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a 16 bit hex string.': function (topic) {
            var field = topic.parse('l16h');
            assert.deepEqual(field, [
                { signed: false
                , bits: 16
                , endianness: 'l'
                , bytes: 2
                , type: 'h'
                , unpacked: true
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single 32 bit float.': function (topic) {
            var field = topic.parse('b32f');
            assert.deepEqual(field, [
                { signed: true
                , bits: 32
                , endianness: 'b'
                , bytes: 4
                , type: 'f'
                , unpacked: true
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a single 64 bit float.': function (topic) {
            var field = topic.parse('b64f');
            assert.deepEqual(field, [
                { signed: true
                , bits: 64
                , endianness: 'b'
                , bytes: 8
                , type: 'f'
                , unpacked: true
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'an array of 8 bytes.': function (topic) {
            var field = topic.parse('b8[8]');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: 8
                }
            ]);
        },
        'a length encoded array of 16 bit numbers.': function (topic) {
            var field = topic.parse('b8/b16');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: false
                , repeat: 1
                , length: true
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
            ]);
        },
        'an list of bytes terminated by zero.': function (topic) {
            var field = topic.parse('b8z');
            assert.deepEqual(field, [
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
            ]);
        },
        'a zero terminated array of 8 bytes zero filled.': function (topic) {
            var field = topic.parse('b8[8]{0}z');
            assert.deepEqual(field, [
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
            ]);
        },
        'a zero terminated array of 8 bytes 0x10 filled.': function (topic) {
            var field = topic.parse('b8[8]{0x10}z');
            assert.deepEqual(field, [
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
            ]);
        },
        'a zero terminated array of 8 bytes 010 filled.': function (topic) {
            var field = topic.parse('b8[8]{010}z');
            assert.deepEqual(field, [
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
            ]);
        },
        'an list of bytes termianted by zero piped to a transform.': function (topic) {
            var field = topic.parse('b8z|str()');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "str"
                    , parameters: [] 
                    }
                  ]
                }
            ]);
        },
        'a transform a with a single parameter.': function (topic) {
            var field = topic.parse('b8z|str("utf8")');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "str"
                    , parameters: [ "utf8" ] 
                    }
                  ]
                }
            ]);
        },
        'a transform followed by a 16 bit number.': function (topic) {
            var field = topic.parse('b8z|str("utf8")b16');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
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
            ]);
        },
        'a transform with an integer parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle(8)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ 8 ] 
                    }
                  ]
                }
            ]);
        },
        'a transform with a negative integer parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle(-8)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ -8 ] 
                    }
                  ]
                }
            ]);
        },
        'a transform with an float parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle(' + Number.MAX_VALUE + ')');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ Number.MAX_VALUE ] 
                    }
                  ]
                }
            ]);
        },
        'a transform with a negative float parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle(' + Number.MIN_VALUE + ')');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ Number.MIN_VALUE ] 
                    }
                  ]
                }
            ]);
        },
        'a transform with a null parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle(null)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ null ],
                    }
                  ]
                }
            ]);
        },
        'a transform with a true parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle(true)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ true ],
                    }
                  ]
                }
            ]);
        },
        'a transform with a false parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle(false)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ false ],
                    }
                  ]
                }
            ]);
        },
        'a transform with a single quoted string parameter.': function (topic) {
            var field = topic.parse("b8z|twiddle('a \\u00DF b \\' c')");
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ "a \u00DF b \" c" ],
                    }
                  ]
                }
            ]);
        },
        'a transform with a single quoted string parameter.': function (topic) {
            var field = topic.parse('b8z|twiddle("a \\u00DF b \\" c")');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ "a \u00DF b \" c" ],
                    }
                  ]
                }
            ]);
        },
        'a transform with a two parameters.': function (topic) {
            var field = topic.parse('b8z|twiddle("utf8", 8)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ "utf8", 8 ],
                    }
                  ]
                }
            ]);
        },
        'a transform with many parameters.': function (topic) {
            var field = topic.parse('b8z|twiddle("utf8", 8, 8.1, false)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
                  [
                    { name: "twiddle"
                    , parameters: [ "utf8", 8, 8.1, false ],
                    }
                  ]
                }
            ]);
        },
        'a two transforms in a row.': function (topic) {
            var field = topic.parse('b8z|utf8()|atoi(8)');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: Number.MAX_VALUE
                , terminator: "\0"
                , transforms:
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
            ]);
        }
    },
    'Pattern cannot parse': {
        topic: require('pattern'),
        'utter nonsense.': function (topic) {
            assert.throws(function () {
                topic.parse("blurdy");   
            }, Error);
        },
        'a 7 bit pattern.': function (topic) {
            assert.throws(function () {
                topic.parse("b7");   
            }, Error);
        },
        'a 0 bit pattern.': function (topic) {
            assert.throws(function () {
                topic.parse("b0");   
            }, Error);
        },
        'a float pattern other than 32 or 64 bits.': function (topic) {
            assert.throws(function () {
                topic.parse('b16f');
            }, Error);
        }
    }
}).export(module);

/* vim: set ts=2 sw=2 et tw=0: */
