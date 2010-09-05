var vows = require('vows'),
    assert = require('assert'); 

vows.describe('Pattern').addBatch({
    'Pattern provides': {
        topic: require('__internal/pattern'),
        'the parse method': function (topic) {
          assert.isFunction(topic.parse);
        }
    },
    'Pattern can parse':
    { topic: require('__internal/pattern')
    , 'a single byte pattern': function (topic) {
        var field = topic.parse('n8');
        assert.deepEqual(field, [
          { signed: false
          , bits: 8
          , endianness: 'b'
          , bytes: 1
          , type: 'n'
          , arrayed: false
          }
        ]);
      }
    , 'a single signed byte pattern': function (topic) {
        var field = topic.parse('-n8');
        assert.deepEqual(field, [
          { signed: true
          , bits: 8
          , endianness: 'b'
          , bytes: 1
          , type: 'n'
          , arrayed: true
          }
        ]);
      }
    , 'a single 16 bit number pattern': function (topic) {
        var field = topic.parse('n16');
        assert.deepEqual(field, [
          { signed: false
          , bits: 16
          , endianness: 'b'
          , bytes: 2
          , type: 'n'
          , arrayed: false
          }
        ]);
      }
    , 'a single signed 16 bit number pattern': function (topic) {
        var field = topic.parse('-n16');
        assert.deepEqual(field, [
          { signed: true
          , bits: 16
          , endianness: 'b'
          , bytes: 2
          , type: 'n'
          , arrayed: true
          }
        ]);
      }
    , 'a single big-endian 16 bit number pattern': function (topic) {
        var field = topic.parse('b16');
        assert.deepEqual(field, [
          { signed: false
          , bits: 16
          , endianness: 'b'
          , bytes: 2
          , type: 'n'
          , arrayed: false
          }
        ]);
      }
    , 'a single little-endian 16 bit number pattern': function (topic) {
        var field = topic.parse('l16');
        assert.deepEqual(field, [
          { signed: false
          , bits: 16
          , endianness: 'l'
          , bytes: 2
          , type: 'n'
          , arrayed: false
          }
        ]);
      }
    , 'a single signed little-endian 16 bit number pattern': function (topic) {
        var field = topic.parse('-l16');
        assert.deepEqual(field, [
          { signed: true
          , bits: 16
          , endianness: 'l'
          , bytes: 2
          , type: 'n'
          , arrayed: true
          }
        ]);
      }
    , 'a single 16 bit skip pattern': function (topic) {
        var field = topic.parse('s16');
        assert.deepEqual(field, [
          { signed: false
          , bits: 16
          , endianness: 's'
          , bytes: 2
          , type: 'n'
          , arrayed: false
          }
        ]);
      }
    , 'a signed little-endian 16 bit number followed by a byte pattern': function (topic) {
        var field = topic.parse('-l16n8');
        assert.deepEqual(field, [
          { signed: true
          , bits: 16
          , endianness: 'l'
          , bytes: 2
          , type: 'n'
          , arrayed: true
          }
        , { signed: false
          , bits: 8
          , endianness: 'b'
          , bytes: 1
          , type: 'n'
          , arrayed: false
          }
        ]);
      }
    , 'a 16 bit hex string.': function (topic) {
        var field = topic.parse('l16h');
        assert.deepEqual(field, [
          { signed: false
          , bits: 16
          , endianness: 'l'
          , bytes: 2
          , type: 'h'
          , arrayed: true
          }
        ]);
      }
    }
}).export(module);

/* vim: set ts=2 sw=2 et tw=0: */
