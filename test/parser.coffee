{TwerpTest} = require "twerp"
{Parser}    = require "parser"

class exports.ParserTest extends TwerpTest
  start: (done) ->
    @parser = new Parser()
    done()

  "test: read a byte": (done) ->
    invoked = false
    @parser.reset()
    @parser.extract "b8", (field) =>
      @equal @parser.getBytesRead(), 1
      @equal field, 1
      invoked = true
    @parser.read [ 1 ]
    @ok invoked
    done(3)

  "test: read a 16 bit number": (done) ->
    invoked = false
    @parser.reset()
    @parser.extract 'b16', (field) =>
      @equal(@parser.getBytesRead(), 2)
      @equal(field, 0xA0B0)
      invoked = true
    @parser.read [ 0xA0, 0xB0 ]
    @ok invoked
    done(3)

  'test: read a 16 bit big-endian number': (done) ->
    invoked = false
    @parser.reset()
    @parser.extract 'b16', (field) =>
      @equal(@parser.getBytesRead(), 2)
      @equal(field, 0xA0B0)
      invoked = true
    @parser.read [ 0xA0, 0xB0 ]
    @ok invoked
    done(3)

  'test: read a 16 bit little-endian number': (done) ->
    invoked = false
    @parser.reset()
    @parser.extract 'l16, b8', (a, b) =>
      @equal(@parser.getBytesRead(), 3)
      @equal(a, 0xB0A0)
      @equal(b, 0xAA)
      invoked = true
    @parser.read [ 0xA0, 0xB0, 0xAA ]
    @ok invoked
    done(4)

  'test: read a signed byte': (done) ->
    readSigned = (bytes, value) =>
      invoked = false
      @parser.reset()
      @parser.extract '-b8', (field) =>
        @equal(@parser.getBytesRead(), 1)
        @equal(field, value)
        invoked = true
      @parser.read(bytes)
      @ok invoked
    readSigned [ 0xff ], -1
    readSigned [ 0x80 ], -128
    readSigned [ 0x7f ], 127
    readSigned [ 0x02 ], 2
    done(4 * 3)

  'test: read a signed short': (done) ->
    readSigned = (bytes, value) =>
      invoked = false
      @parser.reset()
      @parser.extract '-b16', (field) =>
        @equal(@parser.getBytesRead(), 2)
        @equal(field, value)
        invoked = true
      @parser.read bytes
      @ok invoked
    readSigned [ 0x80, 0x00 ], -32768
    readSigned [ 0xff, 0xff ], -1
    readSigned [ 0x7f, 0xff ],  32767
    readSigned [ 0x01, 0x02 ],  258
    done(4 * 3)

  'test: read a 16 bit integer after skipping two bytes': (done) ->
    invoked = false
    bytes = [ 0x01, 0x02, 0x00, 0x01 ]

    @parser.reset()
    @parser.extract "x16, b16", (field) =>
      @equal @parser.getBytesRead(), 4
      @equal field, 1
      invoked = true
    @parser.read bytes
    @ok invoked
    done(3)

  'test: read a big-endian 64 bit float': (done) ->
    readSingleFloat = (bytes, value) =>
      invoked = false
      @parser.reset()
      @parser.extract "b64f", (field) =>
        @equal @parser.getBytesRead(), 8
        @equal field, value
        invoked = true
      @parser.read bytes
      @ok invoked
    readSingleFloat [ 0xdb, 0x01, 0x32, 0xcf, 0xf6, 0xee, 0xc1, 0xc0 ], -9.1819281981e3
    readSingleFloat [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0xc0 ], -10
    done(3)

  'test: read a 16 bit integer after skipping four bytes': (done) ->
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x04, 0x00, 0x01 ]

    @parser.reset()
    @parser.extract "x16[2], b16", (field) =>
      @equal(@parser.getBytesRead(), 6)
      @equal(field, 1)
      invoked = true
    @parser.read(bytes)

    @ok invoked
    done(3)

  'test: read an array of 8 bytes': (done) ->
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ]
    @parser.reset()
    @parser.extract "b8[8]", (field) =>
      @equal(@parser.getBytesRead(), 8)
      @deepEqual(field, bytes)
      invoked = true
    @parser.read bytes
    @ok invoked
    done(3)

  'test: read a length encoded array of bytes': (done) ->
    invoked = false
    bytes = [ 0x03, 0x02, 0x03, 0x04 ]
    @parser.reset()
    @parser.extract "b8/b8", (field) =>
      @equal @parser.getBytesRead(), 4
      @deepEqual field, bytes.slice(1)
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  'test: read a length encoded array of bytes that is empty': (done) ->
    invoked = false
    bytes = [ 0x00, 0x00, 0x01, 0x02]
    @parser.reset()
    @parser.extract "b16/b8", (field) =>
      @equal @parser.getBytesRead(), 2
      @equal field.length, 0
      invoked = true
    @parser.read bytes
    @ok invoked
    done(3)

  'test: read a zero terminated array of bytes': (done) ->
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x00 ]
    @parser.reset()
    @parser.extract "b8z", (field) =>
      @equal(@parser.getBytesRead(), 8)
      @deepEqual(field, bytes.slice(0, 7))
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  'test: read a zero terminated array of 8 bytes': (done) ->
    invoked = false
    bytes = [ 0x01, 0x02, 0x03, 0x00, 0x05, 0x06, 0x07, 0x08 ]
    @parser.reset()
    @parser.extract "b8[8]z", (field) =>
      @equal @parser.getBytesRead(), 8
      @deepEqual field, bytes.slice(0, 3)
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  'test: read a multiple terminated array of 8 bytes': (done) ->
    invoked = false
    bytes = [ 0x01, 0x02, 0x0D, 0x0D, 0x0A, 0x06, 0x07, 0x08 ]
    @parser.reset()
    @parser.extract "b8[8]z<13,10>", (field) =>
      @equal @parser.getBytesRead(), 8
      @deepEqual field, bytes.slice(0, 3)
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  'test: read a 3 byte ASCII string': (done) ->
    invoked = false
    bytes = [ 0x41, 0x42, 0x43 ]
    @parser.reset()
    @parser.extract "b8[3]|ascii()", (field) =>
      @equal @parser.getBytesRead(), 3
      @equal field, "ABC"
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  'test: read a zero terminated ASCII string': (done) ->
    invoked = false
    bytes = [ 0x41, 0x42, 0x43, 0x00 ]
    @parser.reset()
    @parser.extract "b8z|ascii()", (field) =>
      @equal @parser.getBytesRead(), 4
      @equal field, "ABC"
      invoked = true
    @parser.read bytes, 0, 10
    @ok invoked
    done 3

  'test: read a zero terminated 8 byte padded ASCII string': (done) ->
    invoked = false
    bytes = [ 0x41, 0x42, 0x43, 0x00, 0x00, 0x00, 0x00, 0x00 ]
    @parser.reset()
    @parser.extract "b8[8]z|ascii()", (field) =>
      @equal @parser.getBytesRead(), 8
      @equal field, "ABC"
      invoked = true
    @parser.read bytes, 0, 10
    @ok invoked
    done 3

  'test: read a zero terminated 8 byte padded ASCII string that is 7 characters long': (done) ->
    invoked = false
    bytes = [  0x30, 0x30, 0x30, 0x30, 0x41, 0x42, 0x43, 0x00 ]
    @parser.reset()
    @parser.extract "b8[8]z|ascii()", (field) =>
        @equal @parser.getBytesRead(), 8
        @equal field, "0000ABC"
        invoked = true
    @parser.read bytes, 0, 10
    @ok invoked
    done 3

  'test: read a zero terminated ASCII string converted to integer': (done) ->
    invoked = false
    bytes = [ 0x34, 0x32, 0x00 ]
    @parser.reset()
    @parser.extract "b8z|ascii()|atoi(10)", (field) =>
      @equal @parser.getBytesRead(), 3
      @equal field, 42
      invoked = true
    @parser.read bytes, 0, 10
    @ok invoked
    done 3

  'test: read a zero character padded zero terminated ASCII string converted to integer': (done) ->
    invoked = false
    bytes = [ 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x32, 0x00 ]
    @parser.reset()
    @parser.extract "b8[8]z|ascii()|pad('0', 7)|atoi(10)", (field) =>
      @equal @parser.getBytesRead(), 8
      @equal field, 42
      invoked = true
    @parser.read bytes, 0, 10
    @ok invoked
    done 3

  "test: read a bit packed integer": (done) ->
    invoked = false
    bytes = [ 0x28 ]
    @parser.reset()
    @parser.extract "b8{x2,b3,x3}", (field) =>
      @equal @parser.getBytesRead(), 1
      @equal field, 5
      invoked = true
    @parser.read bytes, 0, 1
    @ok invoked
    done 3

  "test: read a bit packed integer with two fields": (done) ->
    invoked = false
    bytes = [ 0xD0 ]
    @parser.reset()
    @parser.extract "b8{b2,x1,b2,x3}", (one, two) =>
      @equal @parser.getBytesRead(), 1
      @equal one, 3
      @equal two, 2
      invoked = true
    @parser.read bytes, 0, 1
    @ok invoked
    done 4

  "test: read a bit packed signed negative integer": (done) ->
    invoked = false
    bytes = [ 0x20 ]
    @parser.reset()
    @parser.extract "b8{x2,-b3,x3}", (field) =>
      @equal @parser.getBytesRead(), 1
      @equal field, -4
      invoked = true
    @parser.read bytes, 0, 1
    @ok invoked
    done 3

  "test: read a bit packed signed integer": (done) ->
    invoked = false
    bytes = [ 0x18 ]
    @parser.reset()
    @parser.extract "b8{x2,-b3,x3}", (field) =>
      @equal @parser.getBytesRead(), 1
      @equal field, 3 
      invoked = true
    @parser.read bytes, 0, 1
    @ok invoked
    done 3

  "test: read a masked alternative": (done) ->
    invoked = false
    bytes = [ 0x81, 0x00 ]
    @parser.reset()
    @parser.extract "b8(&0x80: b16{x1,b15} | b8)", (field) =>
      @equal @parser.getBytesRead(), 2
      @equal field, 256
      invoked = true
    @parser.read bytes, 0, 2
    @ok invoked
    done 3

  "test: read a default after a masked alternative": (done) ->
    invoked = false
    bytes = [ 0x7f ]
    @parser.reset()
    @parser.extract "b8(&0x80: b16{x1,b15} | b8)", (field) =>
      @equal @parser.getBytesRead(), 1
      @equal field, 127
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  "test: read a ranged alternative": (done) ->
    invoked = false
    bytes = [ 0xfb ]
    @parser.reset()
    @parser.extract "b8(0-251: b8 | 252: x8, b16 | 253: x8, b24 | 254: x8, b64)", (field) =>
      @equal @parser.getBytesRead(), 1
      @equal field, 251
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  "test: read an exact alternative": (done) ->
    invoked = false
    bytes = [ 253, 0x00, 0x01, 0x00 ]
    @parser.reset()
    @parser.extract "b8(0-251: b8 | 252: x8, b16 | 253: x8, b24 | 254: x8, b64)", (field) =>
      @equal @parser.getBytesRead(), 4
      @equal field, 256
      invoked = true
    @parser.read bytes
    @ok invoked
    done 3

  "test: set self": (done) ->
    self = {}
    parser = new Parser(self)
    invoked = false
    parser.reset()
    parser.extract "b8", (field) ->
      invoked = self is this
    parser.read [ 1 ]
    @ok invoked
    done 1

  "test: read object": (done) ->
    invoked = false
    @parser.reset()
    @parser.extract "b16 => length, b8 => type, b8z|utf8() => name", (object) =>
      @equal @parser.getBytesRead(), 7
      @deepEqual object,
        length: 258
        type: 8
        name: "ABC"
      invoked = true
    @parser.read [ 0x01, 0x02, 0x08, 0x41, 0x42, 0x43, 0x00 ]
    @ok invoked
    done 3

  "test: read a bit packed integer into an object": (done) ->
    invoked = false
    bytes = [ 0x01, 0x02, 0xD0 ]
    @parser.reset()
    @parser.extract "b16 => short, b8{b2 => high, x1, b2 => low, x3}", (object) =>
      @equal @parser.getBytesRead(), 3
      @equal object.short, 258
      @equal object.high, 3
      @equal object.low, 2
      invoked = true
    @parser.read bytes, 0, 3
    @ok invoked
    done 5
