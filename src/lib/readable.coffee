# Require `"stream"` for the base `Stream` implementation.
stream    = require "stream"

# This implementation of `ReadableStream` is returned when the user calls the
# `Parser.stream` method. It creates a stream that allows a `Parser`
# implementation to emit raw binary data.

# Implementation of the `ReadableStream` interface.
class exports.ReadableStream extends stream.Stream
  # Construct a readable stream for the given `Parser`.
  constructor: (@_parser) ->

  # Set the encoding used to convert binary data to strings before it is emitted
  # as a `"data"` event.
  setEncoding: (encoding) ->
    @_decoder = new (require("string_decoder").StringDecoder)(encoding)

  
  _delegate: (method) -> @_parser[method]() if @_parser.piped

  # Pause the source stream that is feeding the associated `Parser`.
  pause: -> @_parser.pause()

  # Result the source stream that is feeding the associated `Parser`.
  resume: -> @_parser.resume()

  # Soon destory the source stream that is feeding the associated `Parser`.
  destroySoon: -> @_parser.destroySoon()

  # Destory the source stream that is feeding the associated `Parser`.
  destroy: -> @_parser.destroy()

  # Emit the `"end"` event.
  _end: ->
    @emit "end"
    @_parser._stream = null

  # Emit the given buffer as a `"data"` event, decoding it if a decoder has been
  # specified.
  _write: (slice) ->
    if @_decoder
      string = @_decoder.write(slice)
      @emit "data", string if string.length
    else
      @emit "data", slice
