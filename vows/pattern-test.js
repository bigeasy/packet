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
            var field = topic.parse('n8');
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
            var field = topic.parse('-n8');
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
            var field = topic.parse('n16');
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
            var field = topic.parse('-n16');
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
            var field = topic.parse('s16');
            assert.deepEqual(field, [
                { signed: false
                , bits: 16
                , endianness: 's'
                , bytes: 2
                , type: 'n'
                , unpacked: false
                , arrayed: false
                , repeat: 1
                }
            ]);
        },
        'a signed little-endian 16 bit number followed by a byte': function (topic) {
            var field = topic.parse('-l16n8');
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
            var field = topic.parse('n8[8]');
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
        'an list of bytes terminated by zero.': function (topic) {
            var field = topic.parse('n8z');
            assert.deepEqual(field, [
                { signed: false
                , bits: 8
                , endianness: 'b'
                , bytes: 1
                , type: 'n'
                , unpacked: false
                , arrayed: true
                , repeat: 1
                , terminator: "\0"
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
