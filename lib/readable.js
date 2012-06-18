// Require `"stream"` for the base `Stream` implementation.
var stream    = require("stream");

// This implementation of `ReadableStream` is returned when the user calls the
// `Parser.stream` method. It creates a stream that allows a `Parser`
// implementation to emit raw binary data.

// Construct a readable stream for the given `Parser`.
function ReadableStream(parser, length, callback) {
  stream.Stream.call(this);
    // FIXME You must invoke the callback when the length is reached.
  this._parser = parser, this._length = length, this._callback = callback;
}

// Implementation of the `ReadableStream` interface.

// Set the encoding used to convert binary data to strings before it is emitted
// as a `"data"` event.
ReadableStream.prototype.setEncoding = function (encoding) {
  this._decoder = new (require("string_decoder").StringDecoder)(encoding);
}

// Emit the `"end"` event.
ReadableStream.prototype._end = function () {
  this.emit("end");
  this._parser._stream = null;
}

// Emit the given buffer as a `"data"` event, decoding it if a decoder has been
// specified.
ReadableStream.prototype._write = function (slice) {
  if (this._decoder) {
    string = this._decoder.write(slice);
    this.emit("data", string.length ? string : null);
  } else {
    this.emit("data", slice);
  }
}

// A loop to create delegates for method that really exist in the `Parser`.
"pause resume destroySoon destroy".split(/\s+/).forEach(function (method) {
  ReadableStream.prototype[method] = function () { this._parser[method]() };
});
