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
        },
        'parse a 16 bit pattern': function (t) {
            t.packet('two-bytes', 'n16');
        },
        'read 16 bit number from a buffer': function (t) {
            t.packet('two-bytes', 'n16');
        }
    }
}).export(module);

/* vim: set ts=2 sw=2 et tw=0: */
