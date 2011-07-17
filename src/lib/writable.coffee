# Require `"stream"` for the base `Stream` implementation.
stream    = require "stream"

# This implementation of `WritableStream` is returned when the user calls the
# `Serializer.stream` method. It create a stream that will write a specified
# number of bytes, no more, no less.

# Implementation of the `WritableStream` interface.
class exports.WritableStream extends stream.Stream
  # Construct the writable stream for the given `Serializer`. The `@_length` is
  # used to test for overflow. The `@_callback` is invoked when the all bytes
  # have been written.
  constructor: (@_length, @_serializer, @_callback) ->
    @writable = true
    @_written = 0

  # Write the `Buffer` or `String` given in `buffer` with the given `encoding`
  # or UTF-8 if no encoding is specified.
  write: (buffer, encoding) ->
    if typeof buffer is "string"
      buffer = new Buffer(buffer, encoding or "utf8")
    @_written += buffer.length
    @_serializer.write buffer
    if @_written > @_length
      throw new Error "buffer overflow"
    else if @_wrtten == @_length
      @_serializer._stream = null
      if @_callback
        @_callback.apply @_serializer.self, @_length

  # The end of the stream is determined by the user specified length, not by the
  # invocation of this method, so this implementation of `@end` is a synonym for
  # `@write`.
  end: (splat...) ->
    @write.apply @, splat if splat.length
  
