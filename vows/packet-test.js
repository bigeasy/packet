var vows = require('vows'),
    assert = require('assert'); 

vows.describe('Packet').addBatch({
    'Packet can': {
        topic: require('packet').create(),
        'parse a byte pattern': function (t) {
            t.packet('one-byte', 'n8');
        },
        'read a byte from a buffer': function (t) {
            t.packet('one-byte', 'n8');
            t.read('one-byte', [ 1 ], function(field) {
            });
        },
        'parse a 16 bit pattern': function (t) {
            t.packet('two-bytes', 'n16');
        },
        'read 16 bit number from a buffer': function (t) {
            t.packet('two-bytes', 'n16');
            t.read('two-bytes', [ 0xA0, 0xBB ], function(field) {
              asssert.equals(field, 0xA0BB);
            });
        }
    }
}).export(module);

/* vim: set ts=2 sw=2 et tw=0: */
