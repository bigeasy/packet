var vows = require('vows'),
    assert = require('assert'); 

vows.describe('Packet').addBatch({
    'Packet can read': {
        topic: new (require('packet').Parser)(),
        'a byte': function (topic) {
            var invoked = false;
            topic.reset();
            topic.parse('b8', function (field, engine) {
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
            topic.parse('b16', function (field, engine) {
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
            topic.parse('b16', function (field, engine) {
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
            topic.parse('l16, b8', function (a, b, engine) {
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
                topic.parse('-b8', function (field, engine) {
                    assert.equal(engine.getBytesRead(), 1);
                    assert.equal(field, value);
                    invoked = true;
                });
                topic.read(bytes);
                assert.isTrue(invoked);
            }
            readSigned([ 0xff ], -1);
            readSigned([ 0x80 ], -128);
            readSigned([ 0x7f ], 127);
            readSigned([ 0x02 ], 2);
        },
        'a signed short': function (topic) {
            function readSigned(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.parse('-b16', function (field, engine) {
                    assert.equal(engine.getBytesRead(), 2);
                    assert.equal(field, value);
                    invoked = true;
                });
                topic.read(bytes);
                assert.isTrue(invoked);
            }
            readSigned([ 0x80, 0x00 ], -32768);
            readSigned([ 0xff, 0xff ], -1);
            readSigned([ 0x7f, 0xff ],  32767);
            readSigned([ 0x01, 0x02 ],  258);
        },
        'a little-endian 32 bit hex string': function (topic) {
            function readHexString(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.parse('l32h', function (field, engine) {
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
                topic.parse('b32h', function (field, engine) {
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
        'a 16 bit integer after skipping two bytes': function (topic) {
            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x00, 0x01 ];

            topic.reset();
            topic.parse("x16, b16", function (field, engine) {
                assert.equal(engine.getBytesRead(), 4);
                assert.equal(field, 1);
                invoked = true;
            });
            topic.read(bytes);

            assert.isTrue(invoked);
        },
        'a big-endian 64 bit float': function (topic) {
            function readSingleFloat(bytes, value) {
                var invoked = false;
                topic.reset();
                topic.parse("b64f", function (field, engine) {
                    assert.equal(engine.getBytesRead(), 8);
                    assert.equal(field, value);
                    invoked = true;
                });
                topic.read(bytes);
                assert.isTrue(invoked);
            }
            readSingleFloat([ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3);
            readSingleFloat([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10); 
        },
        'a 16 bit integer after skipping four bytes': function (topic) {
            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x04, 0x00, 0x01 ];

            topic.reset();
            topic.parse("x16[2], b16", function (field, engine) {
                assert.equal(engine.getBytesRead(), 6);
                assert.equal(field, 1);
                invoked = true;
            });
            topic.read(bytes);

            assert.isTrue(invoked);
        },
        'an array of 8 bytes': function (topic) {
            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]

            topic.reset();
            topic.parse("b8[8]", function (field, engine) {
                assert.equal(engine.getBytesRead(), 8);
                assert.deepEqual(field, bytes);
                invoked = true;
            });
            topic.read(bytes);

            assert.isTrue(invoked);
        },
        'a length encoded array of bytes': function (topic) {
            var invoked = false;
            var bytes = [ 0x03, 0x02, 0x03, 0x04 ]

            topic.reset();
            topic.parse("b8/b8", function (field, engine) {
                assert.equal(engine.getBytesRead(), 4);
                assert.deepEqual(field, bytes.slice(1));
                invoked = true;
            });
            topic.read(bytes);

            assert.isTrue(invoked);
        },
        'a zero terminated array of bytes': function (topic) {
            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x00 ]
            topic.reset();
            topic.parse("b8z", function (field, engine) {
                assert.equal(engine.getBytesRead(), 8);
                assert.deepEqual(field, bytes);
                invoked = true;
            });
            topic.read(bytes);
            assert.isTrue(invoked);
        },
        'a zero terminated array of 8 bytes': function (topic) {
            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x00, 0x05, 0x06, 0x07, 0x08 ]
            topic.reset();
            topic.parse("b8[8]z", function (field, engine) {
                assert.equal(engine.getBytesRead(), 8);
                assert.deepEqual(field, bytes.slice(0, 4));
                invoked = true;
            });
            topic.read(bytes);
            assert.isTrue(invoked);
        },
        'a 3 byte ASCII string': function (topic) {
            var invoked = false;
            var bytes = [ 0x41, 0x42, 0x43 ]
            topic.reset();
            topic.parse("b8[3]|ascii()", function (field, engine) {
                assert.equal(engine.getBytesRead(), 3);
                assert.equal(field, "ABC")
                invoked = true;
            });
            topic.read(bytes);
            assert.isTrue(invoked);
        },
        'a zero terminated ASCII string': function (topic) {
            var invoked = false;
            var bytes = [ 0x41, 0x42, 0x43, 0x00 ]
            topic.reset();
            topic.parse("b8z|ascii()", function (field, engine) {
                assert.equal(engine.getBytesRead(), 4);
                assert.equal(field, "ABC")
                invoked = true;
            });
            topic.read(bytes, 0, 10);
            assert.isTrue(invoked);
        },
        'a zero terminated 8 byte padded ASCII string': function (topic) {
            var invoked = false;
            var bytes = [ 0x41, 0x42, 0x43, 0x00, 0x00, 0x00, 0x00, 0x00 ]
            topic.reset();
            topic.parse("b8[8]z|ascii()", function (field, engine) {
                assert.equal(engine.getBytesRead(), 8);
                assert.equal(field, "ABC")
                invoked = true;
            });
            topic.read(bytes, 0, 10);
            assert.isTrue(invoked);
        },
        'a zero terminated 8 byte padded ASCII string that is 7 characters long': function (topic) {
            var invoked = false;
            var bytes = [  0x30, 0x30, 0x30, 0x30, 0x41, 0x42, 0x43, 0x00 ]

            topic.reset();
            topic.parse("b8[8]z|ascii()", function (field, engine) {
                assert.equal(engine.getBytesRead(), 8);
                assert.equal(field, "0000ABC")
                invoked = true;
            });
            topic.read(bytes, 0, 10);

            assert.isTrue(invoked);
        },
        'a zero terminated ASCII string converted to integer': function (topic) {
            var invoked = false;
            var bytes = [ 0x34, 0x32, 0x00 ]

            topic.reset();
            topic.parse("b8z|ascii()|atoi(10)", function (field, engine) {
                assert.equal(engine.getBytesRead(), 3);
                assert.equal(field, 42)
                invoked = true;
            });
            topic.read(bytes, 0, 10);

            assert.isTrue(invoked);
        },
        'a zero character padded zero terminated ASCII string converted to integer': function (topic) {
            var invoked = false;
            var bytes = [ 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x32, 0x00 ]

            topic.reset();
            topic.parse("b8[8]z|ascii()|pad('0', 7)|atoi(10)", function (field, engine) {
                assert.equal(engine.getBytesRead(), 8);
                assert.equal(field, 42)
                invoked = true;
            });
            topic.read(bytes, 0, 10);

            assert.isTrue(invoked);
        }
    },
    'Packet can write': {
        topic: new (require('packet').Serializer)(),
        'a byte': function (topic) {
            var buffer = [];
            topic.reset();
            topic.serialize("b8", 0x01, function (engine) { 
                assert.equal(engine.getBytesWritten(), 1);
            });
            topic.write(buffer, 0, 1);
            assert.equal(buffer[0], 0x01);
        },
        'a little-endian 16 bit integer': function (topic) {
            var buffer = [];
            topic.reset();
            topic.serialize("l16", 0x1FF, function (engine) { 
                assert.equal(engine.getBytesWritten(), 2);
            });
            topic.write(buffer, 0, 2);
            assert.deepEqual(buffer, [  0xFF, 0x01 ]);
        },
        'a big-endian 16 bit integer': function (topic) {
            var buffer = [];
            topic.reset();
            topic.serialize("b16", 0x1FF, function (engine) { 
                assert.equal(engine.getBytesWritten(), 2);
            });
            topic.write(buffer, 0, 2);
            assert.deepEqual(buffer, [  0x01, 0xFF ]);
        },
        'a little-endian 16 bit integer followed by a big-endian 16 bit integer': function (topic) {
            var buffer = [];

            topic.reset();
            topic.serialize("l16, b16", 0x1FF, 0x1FF, function (engine) { 
                assert.equal(engine.getBytesWritten(), 4);
            });
            topic.write(buffer, 0, 4);

            assert.deepEqual(buffer, [  0xFF, 0x01, 0x01, 0xFF ]);
        },
        'a 16 bit integer after skipping two bytes': function (topic) {
            var buffer = [ 0xff, 0xff, 0xff, 0xff ];

            topic.reset();
            topic.serialize("x16, b16", 1, function (engine) { 
                assert.equal(engine.getBytesWritten(), 4);
            });
            topic.write(buffer, 0, 6);

            assert.deepEqual(buffer, [  0xff, 0xff, 0x00, 0x01 ]);
        },
        'a 16 bit integer after filling two bytes': function (topic) {
            var buffer = [ 0xff, 0xff, 0xff, 0xff ];

            topic.reset();
            topic.serialize("x16{0}, b16", 1, function (engine) { 
                assert.equal(engine.getBytesWritten(), 4);
            });
            topic.write(buffer, 0, 4);

            assert.deepEqual(buffer, [  0x00, 0x00, 0x00, 0x01 ]);
        },
        'a little-endian 64 bit IEEE 754 float': function (topic) {
            function writeDoubleFloat(bytes, value) {
                var buffer = [];

                var invoked = false;
                topic.reset();
                topic.serialize("b64f", value, function (engine) {
                    assert.equal(engine.getBytesWritten(), 8);
                    invoked = true;
                });
                topic.write(buffer, 0, 8);

                assert.isTrue(invoked);
                assert.deepEqual(buffer, bytes);
            }
            writeDoubleFloat([ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3);
            writeDoubleFloat([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10); 
        },
        'an array of 8 bytes': function (topic) {
            var buffer = [];

            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
            topic.reset();
            topic.serialize("b8[8]", bytes, function (engine) {
                assert.equal(engine.getBytesWritten(), 8);
                invoked = true;
            });

            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, bytes);
        },
        'a 16 bit integer after skipping four bytes': function (topic) {
            var buffer = [ 0xff, 0xff, 0xff, 0xff ];

            topic.reset();
            topic.serialize("x16[2], b16", 1, function (engine) { 
                assert.equal(engine.getBytesWritten(), 6);
            });
            topic.write(buffer, 0, 7);

            assert.deepEqual(buffer, [ 0xff, 0xff, 0xff, 0xff, 0x00, 0x01 ]);
        },
        'a 16 bit integer after filling four bytes': function (topic) {
            var buffer = [];

            topic.reset();
            topic.serialize("x16[2]{0}, b16", 1, function (engine) { 
                assert.equal(engine.getBytesWritten(), 6);
            });
            topic.write(buffer, 0, 7);

            assert.deepEqual(buffer, [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x01 ]);
        },
        'a length encoded array of bytes': function (topic) {
            var buffer = [];

            var invoked = false;
            var bytes = [ 0x03, 0x02, 0x03, 0x04 ]

            topic.reset();
            topic.serialize("b8/b8", bytes.slice(1), function (engine) {
                assert.equal(engine.getBytesWritten(), 4);
                invoked = true;
            });
            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, bytes);
        },
        'a zero terminated array of bytes': function (topic) {
            var buffer = [];

            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x00 ]
            topic.reset();
            topic.serialize("b8z", bytes, function (engine) {
                assert.equal(engine.getBytesWritten(), 4);
                invoked = true;
            });

            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, bytes);
        },
        'a zero terminated array of 8 bytes': function (topic) {
            var buffer = [];

            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x00 ]
            topic.reset();
            topic.serialize("b8[8]z", bytes, function (engine) {
                assert.equal(engine.getBytesWritten(), 8);
                invoked = true;
            });

            buffer = []
            for (var i = 0; i < 8; i++) {
              buffer[i] = 0x01;
            }
            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x01, 0x02, 0x03, 0x00, 0x01, 0x01, 0x01, 0x01 ]);
        },
        'a zero terminated array of 8 bytes zero filled': function (topic) {
            var buffer = [];

            var invoked = false;
            var bytes = [ 0x01, 0x02, 0x03, 0x00 ]
            topic.reset();
            topic.serialize("b8[8]{0}z", bytes, function (engine) {
                assert.equal(engine.getBytesWritten(), 8);
                invoked = true;
            });

            buffer = []
            for (var i = 0; i < 8; i++) {
              buffer[i] = 0x01;
            }
            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x01, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
        },
        'a 3 byte ASCII string': function (topic) {
            var buffer = [];

            var invoked = false;
            topic.reset();
            topic.serialize("b8[3]|ascii()", "ABC", function (engine) {
                assert.equal(engine.getBytesWritten(), 3);
                invoked = true;
            });
            topic.write(buffer, 0, 10);
            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x41, 0x42, 0x43 ]);
        },
        'a zero terminated UTF-8 string': function (topic) {
            var buffer = [];

            var invoked = false;
            topic.reset();
            topic.serialize("b8z|utf8()", "ABC", function (engine) {
                assert.equal(engine.getBytesWritten(), 4);
                invoked = true;
            });
            topic.write(buffer, 0, 10);
            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x41, 0x42, 0x43, 0x00 ]);
        },
        'a zero terminated 8 byte padded UTF-8 string': function (topic) {
            var buffer = [];

            var invoked = false;
            topic.reset();
            topic.serialize("b8[8]{1}z|utf8()", "ABC", function (engine) {
                assert.equal(engine.getBytesWritten(), 8);
                invoked = true;
            });
            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x41, 0x42, 0x43, 0x00, 0x01, 0x01, 0x01, 0x01 ]);
        },
        'a zero terminated 8 byte padded UTF-8 string that is 7 characters long': function (topic) {
            var buffer = [];

            var invoked = false;
            topic.reset();
            topic.serialize("b8[8]{0}z|utf8()", "0000ABC", function (engine) {
                assert.equal(engine.getBytesWritten(), 8);
                invoked = true;
            });
            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x30, 0x30, 0x30, 0x30, 0x41, 0x42, 0x43, 0x00 ]);
        },
        'an integer converted to a zero terminated UTF-8 string': function (topic) {
            var buffer = [];

            var invoked = false;
            topic.reset();
            topic.serialize("b8z|utf8()|atoi(10)", "42", function (engine) {
                assert.equal(engine.getBytesWritten(), 3);
                invoked = true;
            });
            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x34, 0x32, 0x00 ]);
        },
        'an integer converted to a zero padded zero terminated UTF-8 string': function (topic) {
            var buffer = [];

            var invoked = false;
            topic.reset();
            topic.serialize("b8z|utf8()|pad('0', 7)|atoi(10)", "42", function (engine) {
                assert.equal(engine.getBytesWritten(), 8);
                invoked = true;
            });
            topic.write(buffer, 0, 10);

            assert.isTrue(invoked);
            assert.deepEqual(buffer, [ 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x32, 0x00 ]);
        }
    }
}).export(module);

/* vim: set ts=4 sw=4 et tw=0 nowrap: */
