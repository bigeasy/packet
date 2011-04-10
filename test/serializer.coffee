{TwerpTest}   = require "twerp"
{Serializer}  = require "packet"

class module.exports.SerializerTest extends TwerpTest
  start: (done) ->
    @parser = new Serializer()
    done()

  'test: write a byte': (done) ->
    buffer = []
    @parser.reset()
    @parser.serialize "b8", 0x01, (engine) =>
      @equal engine.getBytesWritten(), 1
    @parser.write buffer, 0, 1
    @equal buffer[0], 0x01
    done 2

  'test: write a little-endian 16 bit integer': (done) ->
    buffer = []
    @parser.reset()
    @parser.serialize "l16", 0x1FF, (engine) =>
      @equal engine.getBytesWritten(), 2
    @parser.write buffer, 0, 2
    @deepEqual buffer, [  0xFF, 0x01 ]
    done 2

  'test: write a big-endian 16 bit integer': (done) ->
    buffer = []
    @parser.reset()
    @parser.serialize "b16", 0x1FF, (engine) =>
      @equal engine.getBytesWritten(), 2
    @parser.write buffer, 0, 2
    @deepEqual buffer, [  0x01, 0xFF ]
    done 2

  'test: write a little-endian followed by a big-endian': (done) ->
    buffer = []
    @parser.reset()
    @parser.serialize "l16, b16", 0x1FF, 0x1FF, (engine) =>
      @equal engine.getBytesWritten(), 4
    @parser.write buffer, 0, 4
    @deepEqual buffer, [  0xFF, 0x01, 0x01, 0xFF ]
    done 2

  'test: write a 16 bit integer after skipping two bytes': (done) ->
    buffer = [ 0xff, 0xff, 0xff, 0xff ]
    @parser.reset()
    @parser.serialize "x16, b16", 1, (engine) =>
      @equal engine.getBytesWritten(), 4
    @parser.write buffer, 0, 6
    @deepEqual buffer, [  0xff, 0xff, 0x00, 0x01 ]
    done 2

  'test: write a 16 bit integer after filling two bytes': (done) ->
    buffer = [ 0xff, 0xff, 0xff, 0xff ]
    @parser.reset()
    @parser.serialize "x16{0}, b16", 1, (engine) =>
      @equal engine.getBytesWritten(), 4
    @parser.write buffer, 0, 4
    @deepEqual buffer, [  0x00, 0x00, 0x00, 0x01 ]
    done 2

  'test: write a little-endian 64 bit IEEE 754 float': (done) ->
    writeDoubleFloat = (bytes, value) =>
      buffer = []
      invoked = false
      @parser.reset()
      @parser.serialize "b64f", value, (engine) =>
        @equal engine.getBytesWritten(), 8
        invoked = true
      @parser.write buffer, 0, 8
      @ok invoked
      @deepEqual buffer, bytes
    writeDoubleFloat [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3
    writeDoubleFloat [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10
    done 2 * 3

  'test: write an array of 8 bytes': (done) ->
    buffer = []
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
    @parser.reset()
    @parser.serialize "b8[8]", bytes, (engine) =>
      @equal engine.getBytesWritten(), 8
      invoked = true
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, bytes
    done 3

  'test: write a 16 bit integer after skipping four bytes': (done) ->
    buffer = [ 0xff, 0xff, 0xff, 0xff ]
    @parser.reset()
    @parser.serialize "x16[2], b16", 1, (engine) =>
      @equal engine.getBytesWritten(), 6
    @parser.write buffer, 0, 7
    @deepEqual buffer, [ 0xff, 0xff, 0xff, 0xff, 0x00, 0x01 ]
    done 2

  'test: write a 16 bit integer after filling four bytes': (done) ->
    buffer = []
    @parser.reset()
    @parser.serialize "x16[2]{0}, b16", 1, (engine) =>
      @equal engine.getBytesWritten(), 6
    @parser.write buffer, 0, 7
    @deepEqual buffer, [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x01 ]
    done 2

  'test: write a length encoded array of bytes': (done) ->
    buffer = []
    invoked = false
    bytes = [ 0x03, 0x02, 0x03, 0x04 ]
    @parser.reset()
    @parser.serialize "b8/b8", bytes.slice(1), (engine) =>
      @equal engine.getBytesWritten(), 4
      invoked = true
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, bytes
    done 3

  'test: write a zero terminated array of bytes': (done) ->
    buffer = []
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x04 ]
    @parser.reset()
    @parser.serialize "b8z", bytes, (engine) =>
      @equal engine.getBytesWritten(), 5
      invoked = true
    @parser.write buffer, 0, 10
    @ok invoked
    bytes.push 0
    @deepEqual buffer, bytes
    done 3

  'test: write a zero terminated array of 8 bytes': (done) ->
    buffer = []
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x04 ]
    @parser.reset()
    @parser.serialize "b8[8]z", bytes, (engine) =>
      @equal engine.getBytesWritten(), 8
      invoked = true
    buffer = []
    for i in [0...8]
      buffer[i] = 0x01
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, [ 0x01, 0x02, 0x03, 0x04, 0x00, 0x01, 0x01, 0x01 ]
    done 3

  'test: write a zero terminated array of 8 bytes filled': (done) ->
    buffer = []
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x04 ]
    @parser.reset()
    @parser.serialize "b8[8]{2}z", bytes, (engine) =>
      @equal engine.getBytesWritten(), 8
      invoked = true
    buffer = []
    for i in [0...8]
      buffer[i] = 0x01
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, [ 0x01, 0x02, 0x03, 0x04, 0x00, 0x02, 0x02, 0x02 ]
    done 3

  'test: write a 3 byte ASCII string': (done) ->
    buffer = []
    invoked = false
    @parser.reset()
    @parser.serialize "b8[3]|ascii()", "ABC", (engine) =>
      @equal engine.getBytesWritten(), 3
      invoked = true
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, [ 0x41, 0x42, 0x43 ]
    done 3

  'test: write a zero terminated UTF-8 string': (done) ->
    buffer = []
    invoked = false
    @parser.reset()
    @parser.serialize "b8z|utf8()", "ABC", (engine) =>
      @equal engine.getBytesWritten(), 4
      invoked = true
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, [ 0x41, 0x42, 0x43, 0x00 ]
    done 3

  'test: write a zero terminated 8 byte padded UTF-8 string': (done) ->
    buffer = []

    invoked = false
    @parser.reset()
    @parser.serialize "b8[8]{1}z|utf8()", "ABC", (engine) =>
      @equal engine.getBytesWritten(), 8
      invoked = true
    @parser.write buffer, 0, 10

    @ok invoked
    @deepEqual buffer, [ 0x41, 0x42, 0x43, 0x00, 0x01, 0x01, 0x01, 0x01 ]
    done 3

  'test: write a zero terminated 8 byte padded UTF-8 string that is 7 characters long': (done) ->
    buffer = []
    invoked = false
    @parser.reset()
    @parser.serialize "b8[8]{0}z|utf8()", "0000ABC", (engine) =>
      @equal engine.getBytesWritten(), 8
      invoked = true
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, [ 0x30, 0x30, 0x30, 0x30, 0x41, 0x42, 0x43, 0x00 ]
    done 3

  'test: write an integer converted to a zero terminated UTF-8 string': (done) ->
    buffer = []

    invoked = false
    @parser.reset()
    @parser.serialize "b8z|utf8()|atoi(10)", "42", (engine) =>
      @equal engine.getBytesWritten(), 3
      invoked = true
    @parser.write buffer, 0, 10

    @ok invoked
    @deepEqual buffer, [ 0x34, 0x32, 0x00 ]
    done 3

  'test: write an integer converted to a zero padded zero terminated UTF-8 string': (done) ->
    buffer = []
    invoked = false
    @parser.reset()
    @parser.serialize "b8z|utf8()|pad('0', 7)|atoi(10)", "42", (engine) =>
      @equal engine.getBytesWritten(), 8
      invoked = true
    @parser.write buffer, 0, 10
    @ok invoked
    @deepEqual buffer, [ 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x32, 0x00 ]
    done 3
