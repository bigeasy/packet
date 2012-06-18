// Require `"stream"` for the base `Stream` implementation.
var stream    = require("stream");
var util = require("util");

// This implementation of `WritableStream` is returned when the user calls the
// `Serializer.stream` method. It create a stream that will write a specified
// number of bytes, no more, no less.

// Construct the writable stream for the given `Serializer`. The `this._length`
// is used to test for overflow. The `this._callback` is invoked when the all
// bytes have been written.
function WritableStream(length, serializer, callback) {
  this._length = length, this._serializer = serializer, this._callback = callback;
  this.writable = true, this._wrtten = 0;
}

// Implementation of the `WritableStream` interface.
util.inherits(WritableStream, stream.Stream);

// Write the `Buffer` or `String` given in `buffer` with the given `encoding`
// or UTF-8 if no encoding is specified.
WritableStream.prototype.write = function (buffer, encoding) {
  if (typeof buffer == "string") {
    buffer = new Buffer(buffer, encoding || "utf8")
  }
  this._written += buffer.length
  this._serializer.write(buffer)
  if (this._written > this._length) {
    throw new Error("buffer overflow")
  } else if (this._wrtten == this._length) {
    this._serializer._stream = null;
    if (this._callback)
      this._callback.apply(this._serializer.self, this._length);
  }
}

var __slice = [].slice;
// The end of the stream is determined by the user specified length, not by the
// invocation of this method, so this implementation of `end` is a synonym for
// `write`.
WritableStream.prototype.end = function () {
  if (arguments.length) this.write.apply(this, __slice.call(arguments, 0));
}

