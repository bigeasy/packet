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
              topic.packet('-b16', function (field, engine) {
                  assert.equal(engine.bytesRead, 2);
                  assert.equal(field, value);
                  invoked = true;
              });
              topic.read(bytes);
              assert.isTrue(invoked);
            }
            readSigned([ 0x80, 0x00 ], -32768);
            readSigned([ 0xff, 0xff ], -1);
        },
        'read a little-endian 32 bit hex string from a buffer': function (topic) {
            function readHexString(bytes, value) {
              var invoked = false;
              topic.reset();
              topic.packet('l32h', function (field, engine) {
                  assert.equal(engine.bytesRead, 4);
                  assert.equal(field, value);
                  invoked = true;
              });
              topic.read(bytes);
              assert.isTrue(invoked);
            }
            readHexString([ 0x80, 0x00, 0x00, 0x00 ], '00000080');
            readHexString([ 0xff, 0xff, 0xff, 0xff ], 'ffffffff');
            readHexString([ 0xA0, 0xB0, 0xC0, 0xD0 ], 'd0c0b0a0');
        },
        'read a big-endian 32 bit hex string from a buffer': function (topic) {
            function readHexString(bytes, value) {
              var invoked = false;
              topic.reset();
              topic.packet('b32h', function (field, engine) {
                  assert.equal(engine.bytesRead, 4);
                  assert.equal(field, value);
                  invoked = true;
              });
              topic.read(bytes);
              assert.isTrue(invoked);
            }
            readHexString([ 0x80, 0x00, 0x00, 0x00 ], '80000000');
            readHexString([ 0xff, 0xff, 0xff, 0xff ], 'ffffffff');
            readHexString([ 0xA0, 0xB0, 0xC0, 0xD0 ], 'a0b0c0d0');
        },
        'read a 64 bit float from a buffer': function (topic) {
          function readSingleFloat(bytes, value) {
            var invoked = false;
            topic.reset();
            topic.packet("b64f", function (field, engine) {
              assert.equal(engine.bytesRead, 8);
              assert.equal(field, value);
              invoked = true;
            });
            topic.read(bytes);
            assert.isTrue(invoked);
          }
          readSingleFloat([ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3);
          readSingleFloat([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10); 
        }
    }
}).export(module);

/* vim: set ts=2 sw=2 et tw=0 nowrap: */
