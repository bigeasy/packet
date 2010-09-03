var vows = require('vows'),
    assert = require('assert'); 

vows.describe('Packet').addBatch({
    'Packet can': {
        topic: require('packet').create(),
        'read a byte from a buffer': function (topic) {
            var invoked = false;
            topic.reset();
            topic.packet('n8', function (field, engine) {
                assert.equal(engine.bytesRead, 1);
                assert.equal(field, 1);
                invoked = true;
            });
            topic.read([ 1 ]);
            assert.isTrue(invoked);
        },
        'read a 16 bit number from a buffer': function (topic) {
            var invoked = false;
            topic.reset();
            topic.packet('n16', function (field, engine) {
                assert.equal(engine.bytesRead, 2);
                assert.equal(field, 0xA0B0);
                invoked = true;
            });
            topic.read([ 0xA0, 0xB0 ]);
            assert.isTrue(invoked);
        },
        'read a 16 bit big-endian number from a buffer': function (topic) {
            var invoked = false;
            topic.reset();
            topic.packet('b16', function (field, engine) {
                assert.equal(engine.bytesRead, 2);
                assert.equal(field, 0xA0B0);
                invoked = true;
            });
            topic.read([ 0xA0, 0xB0 ]);
            assert.isTrue(invoked);
        },
        'read a 16 bit litte-endian number from a buffer': function (topic) {
            var invoked = false;
            topic.reset();
            topic.packet('l16n8', function (a, b, engine) {
                assert.equal(engine.bytesRead, 3);
                assert.equal(a, 0xB0A0);
                assert.equal(b, 0xAA);
                invoked = true;
            });
            topic.read([ 0xA0, 0xB0, 0xAA ]);
            assert.isTrue(invoked);
        },
        'read a signed byte from a buffer': function (topic) {
            function readSigned(bytes, value) {
              var invoked = false;
              topic.reset();
              topic.packet('-n8', function (field, engine) {
                  assert.equal(engine.bytesRead, 1);
                  assert.equal(field, value);
                  invoked = true;
              });
              topic.read(bytes);
              assert.isTrue(invoked);
            }
            readSigned([ 0x80 ], -128);
            readSigned([ 0xff ], -1);
        },
        'read a signed short from a buffer': function (topic) {
            function readSigned(bytes, value) {
              var invoked = false;
              topic.reset();
              topic.packet('-n16', function (field, engine) {
                  assert.equal(engine.bytesRead, 2);
                  assert.equal(field, value);
                  invoked = true;
              });
              topic.read(bytes);
              assert.isTrue(invoked);
            }
            readSigned([ 0x80, 0x00 ], -32768);
            readSigned([ 0xff, 0xff ], -1);
        }
    }
}).export(module);

/* vim: set ts=2 sw=2 et tw=0: */
