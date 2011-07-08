{TwerpTest}   = require "twerp"
{Serializer}  = require "serializer"


toArray = (buffer) ->
  array = []
  for i in [0...buffer.length]
    array[i] = buffer[i]
  array

class module.exports.SerializerTest extends TwerpTest
  'test: write a byte': (done) ->
    serializer = new Serializer()
    serializer.buffer "b8", 0x01, (buffer) =>
      @equal serializer.getBytesWritten(), 1
      @equal buffer[0], 0x01
      done 2

  'test: write a little-endian 16 bit integer': (done) ->
    serializer = new Serializer()
    serializer.buffer "l16", 0x1FF, (buffer) =>
      @equal serializer.getBytesWritten(), 2
      @deepEqual toArray(buffer), [ 0xFF, 0x01 ]
      done 2

  'test: write a big-endian 16 bit integer': (done) ->
    serializer = new Serializer()
    serializer.buffer "b16", 0x1FF, (buffer) =>
      @equal serializer.getBytesWritten(), 2
      @deepEqual toArray(buffer), [  0x01, 0xFF ]
      done 2

  'test: write a little-endian followed by a big-endian': (done) ->
    serializer = new Serializer()
    serializer.buffer "l16, b16", 0x1FF, 0x1FF, (buffer) =>
      @equal serializer.getBytesWritten(), 4
      @deepEqual toArray(buffer), [  0xFF, 0x01, 0x01, 0xFF ]
      done 2

  'test: write a 16 bit integer after skipping two bytes': (done) ->
    serializer = new Serializer()
    buffer = [ 0xff, 0xff, 0xff, 0xff ]
    serializer.buffer buffer, "x16, b16", 1
    @equal serializer.getBytesWritten(), 4
    @deepEqual buffer, [  0xff, 0xff, 0x00, 0x01 ]
    done 2

  'test: write a 16 bit integer after filling two bytes': (done) ->
    serializer = new Serializer()
    buffer = [ 0xff, 0xff, 0xff, 0xff ]
    serializer.buffer buffer, "x16{0}, b16", 1
    @equal serializer.getBytesWritten(), 4
    @deepEqual buffer, [  0x00, 0x00, 0x00, 0x01 ]
    done 2

  'test: write a little-endian 64 bit IEEE 754 float': (done) ->
    serializer = new Serializer()
    writeDoubleFloat = (bytes, value) =>
      serializer.reset()
      serializer.buffer "b64f", value, (buffer) =>
        @equal serializer.getBytesWritten(), 8
        @deepEqual toArray(buffer), bytes
    writeDoubleFloat [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3
    writeDoubleFloat [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10
    done 2 * 2

  'test: write an array of 8 bytes': (done) ->
    bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
    serializer = new Serializer()
    serializer.buffer "b8[8]", bytes, (buffer) =>
      @equal serializer.getBytesWritten(), 8
      @deepEqual toArray(buffer), bytes
      done 2

  'test: write a 16 bit integer after skipping four bytes': (done) ->
    buffer = [ 0xff, 0xff, 0xff, 0xff ]
    serializer = new Serializer()
    serializer.buffer buffer, "x16[2], b16", 1
    @equal serializer.getBytesWritten(), 6
    @deepEqual buffer, [ 0xff, 0xff, 0xff, 0xff, 0x00, 0x01 ]
    done 2

  'test: write a 16 bit integer after filling four bytes': (done) ->
    buffer = [ 0x01, 0x01, 0x01, 0x01 ]
    serializer = new Serializer()
    serializer.buffer buffer, "x16[2]{0}, b16", 1
    @equal serializer.getBytesWritten(), 6
    @deepEqual buffer, [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x01 ]
    done 2

  'test: write 2 zero filled bytes then two 2 filled bytes': (done) ->
    buffer = [ 0x01, 0x01, 0x01, 0x01, 0x01, 0x01 ]
    serializer = new Serializer()
    serializer.buffer buffer, "x8[2]{0},x8[2]{2}"
    @equal serializer.getBytesWritten(), 4
    @deepEqual buffer, [ 0x00, 0x00, 0x02, 0x02, 0x01, 0x01 ]
    done 2

  'test: write a length encoded array of bytes': (done) ->
    bytes = [ 0x03, 0x02, 0x03, 0x04 ]
    serializer = new Serializer()
    serializer.buffer "b8/b8", bytes.slice(1), (buffer) =>
      @equal serializer.getBytesWritten(), 4
      @deepEqual toArray(buffer), bytes
      done 2

  'test: write a zero terminated array of bytes': (done) ->
    bytes = [ 0x01, 0x02, 0x03, 0x04 ]
    serializer = new Serializer()
    serializer.buffer "b8z", bytes, (buffer) =>
      @equal serializer.getBytesWritten(), 5
      bytes.push 0
      @deepEqual toArray(buffer), bytes
      done 2

  'test: write a zero terminated array of 8 bytes': (done) ->
    bytes = [ 0x01, 0x02, 0x03, 0x04 ]
    buffer = [ 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01 ]
    serializer = new Serializer()
    serializer.buffer buffer, "b8[8]z", bytes
    @equal serializer.getBytesWritten(), 8
    @deepEqual buffer, [ 0x01, 0x02, 0x03, 0x04, 0x00, 0x01, 0x01, 0x01 ]
    done 2

  'test: write a zero terminated array of 8 bytes zero filled': (done) ->
    bytes = [ 0x01, 0x02, 0x03, 0x04 ]
    buffer = [ 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01 ]
    serializer = new Serializer()
    serializer.buffer buffer, "b8[8]{0}z", bytes
    @equal serializer.getBytesWritten(), 8
    @deepEqual buffer, [ 0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00 ]
    done 2

  'test: write a zero terminated array of 8 bytes filled': (done) ->
    bytes = [ 0x01, 0x02, 0x03, 0x04 ]
    buffer = [ 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01 ]
    serializer = new Serializer()
    serializer.buffer buffer, "b8[8]{2}z", bytes
    @equal serializer.getBytesWritten(), 8
    @deepEqual buffer, [ 0x01, 0x02, 0x03, 0x04, 0x00, 0x02, 0x02, 0x02 ]
    done 2

  'test: write a 3 byte ASCII string': (done) ->
    serializer = new Serializer()
    serializer.buffer "b8[3]|ascii()", "ABC", (buffer) =>
      @equal serializer.getBytesWritten(), 3
      @deepEqual toArray(buffer), [ 0x41, 0x42, 0x43 ]
      done 2

  'test: write a zero terminated UTF-8 string': (done) ->
    serializer = new Serializer()
    serializer.buffer "b8z|utf8()", "ABC", (buffer) =>
      @equal serializer.getBytesWritten(), 4
      @deepEqual toArray(buffer), [ 0x41, 0x42, 0x43, 0x00 ]
      done 2

  'test: write a zero terminated 8 byte padded UTF-8 string': (done) ->
    serializer = new Serializer()
    serializer.buffer "b8[8]{1}z|utf8()", "ABC", (buffer) =>
      @equal serializer.getBytesWritten(), 8
      @deepEqual toArray(buffer), [ 0x41, 0x42, 0x43, 0x00, 0x01, 0x01, 0x01, 0x01 ]
      done 2

  'test: write a zero terminated 8 byte padded UTF-8 string that is 7 characters long': (done) ->
    serializer = new Serializer()
    serializer.buffer "b8[8]{0}z|utf8()", "0000ABC", (buffer) =>
      @equal serializer.getBytesWritten(), 8
      @deepEqual toArray(buffer), [ 0x30, 0x30, 0x30, 0x30, 0x41, 0x42, 0x43, 0x00 ]
      done 2

  'test: write an integer converted to a zero terminated UTF-8 string': (done) ->
    serializer = new Serializer()
    serializer.buffer "b8z|utf8()|atoi(10)", "42", (buffer) =>
      @equal serializer.getBytesWritten(), 3
      @deepEqual toArray(buffer), [ 0x34, 0x32, 0x00 ]
      done 2

  'test: write an integer converted to a zero padded zero terminated UTF-8 string': (done) ->
    serializer = new Serializer()
    serializer.buffer "b8z|utf8()|pad('0', 7)|atoi(10)", "42", (buffer) =>
      @equal serializer.getBytesWritten(), 8
      @deepEqual toArray(buffer), [ 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x32, 0x00 ]
      done 2

  "test: set self": (done) ->
    self = this
    serializer = new Serializer(self)
    serializer.write "b8", 0x01, ->
      @ok self is this
      done 1

  "test: write object": (done) ->
    serializer = new Serializer()
    serializer.streaming = true
    object = { length: 258, type: 8, name: "ABC" }
    serializer.buffer "b16 => length, b8 => type, b8z|utf8() => name", object, (buffer) =>
      @equal serializer.getBytesWritten(), 7
      @deepEqual toArray(buffer), [ 0x01, 0x02, 0x08, 0x41, 0x42, 0x43, 0x00 ]
      done 2
