var vows = require('vows'),
    assert = require('assert'); 

vows.describe('Pattern').addBatch({
    'Pattern provides': {
        topic: require('__internal/pattern'),
        'the parse method': function (topic) {
          assert.isFunction(topic.parse);
        }
    },
    'Pattern can parse': {
      topic: require('__internal/pattern'),
      'a single byte pattern': function (topic) {
        var field = topic.parse('n8');
        assert.deepEqual(field, [
          { signed: false
          , bits: 8
          , endianness: 'b'
          , bytes: 1
          }
        ]);
      }
    }
}).export(module);

/* vim: set ts=2 sw=2 et tw=0: */
