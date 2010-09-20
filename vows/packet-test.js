var vows = require('vows'),
    assert = require('assert'); 

vows.describe('Packet').addBatch({
    'Packet can read': {
        topic: require(__dirname + '/../lib/packet__').create(),
        'a byte': function (topic) {
              var invoked = false;
              topic.reset();
              topic.packet('n8', function (field, engine) {
                  assert.equal(engine.getBytesRead(), 1);
                  assert.equal(field, 1);
                  invoked = true;
              });
              topic.read([ 1 ]);
              assert.isTrue(invoked);
        },
        'a 16 bit number': function (topic) {
            var invoked = false;
            topic.reset();
            topic.packet('n16', function (field, engine) {
                assert.equal(engine.getBytesRead(), 2);
                assert.equal(field, 0xA0B0);
                invoked = true;
            });
            topic.read([ 0xA0, 0xB0 ]);
            assert.isTrue(invoked);
        },
        'a 16 bit big-endian number': function (topic) {
            var invoked = false;
            topic.reset();
            topic.packet('b16', function (field, engine) {
                assert.equal(engine.getBytesRead(), 2);
                assert.equal(field, 0xA0B0);
                invoked = true;
            });
            topic.read([ 0xA0, 0xB0 ]);
            assert.isTrue(invoked);
        },
        'a 16 bit litte-endian number': function (topic) {
            var invoked = false;
            topic.reset();
            topic.packet('l16n8', function (a, b, engine) {
                assert.equal(engine.getBytesRead(), 3);
                assert.equal(a, 0xB0A0);
                assert.equal(b, 0xAA);
                invoked = true;
            });
            topic.read([ 0xA0, 0xB0, 0xAA ]);
            assert.isTrue(invoked);
        },
        'a signed byte': function (topic) {
            function readSigned(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.packet('-n8', function (field, engine) {
                    assert.equal(engine.getBytesRead(), 1);
                    assert.equal(field, value);
                    invoked = true;
                });
                topic.read(bytes);
                assert.isTrue(invoked);
            }
            readSigned([ 0xff ], -1);
            readSigned([ 0x80 ], -128);
        },
        'a signed short': function (topic) {
            function readSigned(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.packet('-b16', function (field, engine) {
                    assert.equal(engine.getBytesRead(), 2);
                    assert.equal(field, value);
                    invoked = true;
                });
                topic.read(bytes);
                assert.isTrue(invoked);
            }
            readSigned([ 0x80, 0x00 ], -32768);
            readSigned([ 0xff, 0xff ], -1);
        },
        'a little-endian 32 bit hex string': function (topic) {
            function readHexString(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.packet('l32h', function (field, engine) {
                    assert.equal(engine.getBytesRead(), 4);
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
        'a big-endian 32 bit hex string': function (topic) {
            function readHexString(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.packet('b32h', function (field, engine) {
                    assert.equal(engine.getBytesRead(), 4);
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
        'a 64 bit float': function (topic) {
            function readSingleFloat(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.packet("b64f", function (field, engine) {
                    assert.equal(engine.getBytesRead(), 8);
                    assert.equal(field, value);
                    invoked = true;
                });
                topic.read(bytes);
                assert.isTrue(invoked);
            }
            readSingleFloat([ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3);
            readSingleFloat([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10); 
        }
    },
    'Packet can write': {
        topic: require(__dirname + '/../lib/packet__').create(),
        'a byte': function (topic) {
            var buffer = [];
            topic.reset();
            topic.send("n8", 0x01, function (engine) { 
                assert.equal(engine.getBytesWritten(), 1);
            });
            topic.write(buffer, 0, 1);
            assert.equal(buffer[0], 0x01);
        },
        'a little-endian 16 bit integer': function (topic) {
            var buffer = [];
            topic.reset();
            topic.send("l16", 0x1FF, function (engine) { 
                assert.equal(engine.getBytesWritten(), 2);
            });
            topic.write(buffer, 0, 2);
            assert.deepEqual(buffer, [  0xFF, 0x01 ]);
        },
        'a big-endian 16 bit integer': function (topic) {
            var buffer = [];
            topic.reset();
            topic.send("b16", 0x1FF, function (engine) { 
                assert.equal(engine.getBytesWritten(), 2);
            });
            topic.write(buffer, 0, 2);
            assert.deepEqual(buffer, [  0x01, 0xFF ]);
        },
        'a little-endian 16 bit integer followed by a big-endian 16 bit integer': function (topic) {
            var buffer = [];
            topic.reset();
            topic.send("l16b16", 0x1FF, 0x1FF, function (engine) { 
                assert.equal(engine.getBytesWritten(), 4);
            });
            topic.write(buffer, 0, 4);
            assert.deepEqual(buffer, [  0xFF, 0x01, 0x01, 0xFF ]);
        },
        'a little-endian 64 bit IEEE 754 float': function (topic) {
            function writeDoubleFloat(bytes, value) {
                var buffer = [];

                var invoked = false;
                topic.reset();
                topic.send("b64f", value, function (engine) {
                    assert.equal(engine.getBytesWritten(), 8);
                    invoked = true;
                });
                topic.write(buffer, 0, 8);

                assert.isTrue(invoked);
                assert.deepEqual(buffer, bytes);
            }
            writeDoubleFloat([ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3);
            writeDoubleFloat([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10); 
        }
    }
}).export(module);

/* vim: set ts=4 sw=4 et tw=0 nowrap: */
