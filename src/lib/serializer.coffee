{parse}   = require "./pattern"
ieee754   = require "./ieee754"
stream    = require "stream"
{Packet}  = require "./packet"

class WritableStream extends stream.Stream
  constructor: (@_length, @_serializer, @_callback) ->
    @writable = true
    @_written = 0

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


  end: (splat...) ->
    @write.apply @, splat if splat.length
  

class exports.Serializer extends Packet
  constructor: (self) ->
    super self
    @readable = true
    @_buffer = new Buffer(1024)
    @streaming = false

  getBytesWritten: -> @bytesWritten

  packet: (name, pattern, callback) ->
    super name, pattern, callback
    for part in @_packets[name].pattern
      if part.transforms
        part.transforms.reverse()

  nextField: ->
    pattern       = @pattern[@patternIndex]
    @repeat       = pattern.repeat
    @terminated   = not pattern.terminator
    @terminates   = not @terminated
    @index        = 0

    delete        @padding

    if pattern.endianness is "x"
      @_outgoing.splice @patternIndex, 0, null
      if pattern.padding?
        @padding = pattern.padding

  # Setup the next field in the current pattern to read or write.
  nextValue: ->
    pattern = @pattern[@patternIndex]

    if pattern.endianness is "x" and not @padding?
        @_skipping = pattern.bytes
    else
      if @padding?
        value = @padding
      else if pattern.arrayed
        value = @_outgoing[@patternIndex][@index]
      else
        if pattern.lengthEncoding
          repeat = @_outgoing[@patternIndex].length
          @_outgoing.splice @patternIndex, 0, repeat
          @pattern[@patternIndex + 1].repeat = repeat
        value = @_outgoing[@patternIndex]
      if pattern.unpacked
        value = @pack(value)

      super value

  stream: (length) ->
    @_stream = new WritableStream(length, @)

  _pipe: (destination, options) ->
    if destination instanceof Array
      @_buffer = destination
      @_bufferLength = Number.MAX_VALUE
      @_streaming = false
    else if destination instanceof Buffer
      @_buffer = destination
      @_bufferLength = destination.length
      @_streaming = false
    else
      @_buffer = (@_ownBuffer or= new Buffer(1024))
      @_bufferLength = @_ownBuffer.length
      @_streaming = true
      super destination, options

  skip: (length, fill) ->
    while length
      size = Math.min(length, @_buffer.length)
      length -= size
      for i in [0...size]
        @_buffer[i] = fill
      @write @_buffer.slice 0, size

  buffer: (shiftable...) ->
    if Array.isArray(shiftable[0])
      buffer = shiftable.shift()
      bufferLength = Number.MAX_VALUE
      ownsBuffer = false
    else if Buffer.isBuffer(shiftable[0])
      buffer = shiftable.shift()
      bufferLength = buffer.length
      ownsBuffer = false
    else
      buffer = @_buffer
      bufferLength = @_buffer.length
      ownsBuffer = true

    callback = @_reset(shiftable)
    @callback = null

    read = 0
    while @pattern
      if read is bufferLength
        if ownsBuffer
          expanded = new Buffer buffer.length * 2
          buffer.copy(expanded)
          buffer = expanded
        else
          @emit "error", new Error "buffer overflow"
          return
      read += @_serialize buffer, read, bufferLength - read

    @_buffer = buffer if ownsBuffer

    slice = buffer.slice 0, read
    if callback?
      callback.call @self, slice

    null

  # Using the airity of the callback might be too clever, when we could simply
  # choose a name, such as `serialize` versus `buffer`, or maybe `write` versus
  # `buffer`, where write writes the buffer when it fills, and buffer gathers
  # everthing in a buffer, and gives the user an opportunity to make last minute
  # changes before writing to the stream.
  #
  # Already have plenty of magic with named versus positional arguments.
  write: (shiftable...) ->
    if Array.isArray(shiftable[0])
      shiftable[0] = new Buffer(shiftable[0])
    if Buffer.isBuffer(shiftable[0])
      slice = shiftable.shift()
      if @_decoder
        string = @_decoder.write(slice)
        @emit "data", string if string.length
      else
        @emit "data", slice
    else
      callback = @_reset(shiftable)
      # Implementing pause requires callbacks.
      @callback = null
      while @pattern
        read = @_serialize(@_buffer, 0, @_buffer.length)
        @write @_buffer.slice 0, read
      callback.call @self

  _reset: (shiftable) ->
    if typeof shiftable[shiftable.length - 1] == 'function'
      callback = shiftable.pop()

    nameOrPattern = shiftable.shift()
    packet        = @_packets[nameOrPattern] or {}
    pattern       = packet.pattern or parse(nameOrPattern)
    callback    or= packet.callback or null

    if not packet.pattern
      for part in pattern
        if part.transforms
          part.transforms.reverse()

    @pattern      = pattern
    @callback     = null
    @patternIndex = 0

    if shiftable.length is 1 and
        typeof shiftable[0] is "object" and
        not (shiftable[0] instanceof Array)
      object = shiftable.shift()
      @_outgoing = []
      for part in @pattern
        @_outgoing.push if part.name then object[part.name] else null
    else
      @_outgoing  = shiftable

    for value, i in @_outgoing
      @_outgoing[i] = @pipeline(pattern[i], value)

    @nextField()
    @nextValue()

    callback

  close: ->
    @emit "end"

  pack: (value) ->
    pattern = @pattern[@patternIndex]
    if pattern.type == "f"
      if pattern.bits == 32
        ieee754.toIEEE754Single value
      else
        ieee754.toIEEE754Double value
    else
      value

##### serializer.write(buffer[, offset][, length])
# The `write` method writes to the buffer, returning when the current pattern is
# written, or the end of the buffer is reached.

  # Write to the `buffer` in the region defined by the given `offset` and `length`.
  _serialize: (buffer, offset, length) ->
    start     = offset
    end       = offset + length

    # We set the pattern to null when all the fields have been written, so while
    # there is a pattern to fill and space to write.
    while @pattern and offset < end
      if @_skipping
        advance         = Math.min(@_skipping, end - offset)
        offset         += advance
        @_skipping      -= advance
        @bytesWritten  += advance
        return offset - start if @_skipping

      else
        # If the pattern is unpacked, the value we're writing is an array.
        if @pattern[@patternIndex].unpacked
          loop
            buffer[offset] = @value[@offset]
            @offset += @increment
            @bytesWritten++
            offset++
            break if @offset is @terminal
            return offset - start if offset is end

        # Otherwise we're unpacking bytes of an unsigned integer, the most common
        # case.
        else
          loop
            buffer[offset] = Math.floor(@value / Math.pow(256, @offset)) & 0xff
            @offset += @increment
            @bytesWritten++
            offset++
            break if @offset is @terminal
            return offset - start if offset is end

      # If we have not terminated, check for the termination state change.
      # Termination will change the loop settings.
      if @terminates
        if @terminated
          if @repeat is Number.MAX_VALUE
            @repeat = @index + 1
          else if @pattern[@patternIndex].padding?
            @padding = @pattern[@patternIndex].padding
          else
            @_skipping = (@repeat - (++@index)) * @pattern[@patternIndex].bytes
            if @_skipping
              @repeat = @index + 1
              continue
        else
          # If we are at the end of the series, then we create an empty outgoing
          # array to hold the terminator, because the outgoing series may be a
          # buffer. We insert the terminator at next index in the outgoing array.
          # We then set repeat to allow one more iteration before callback.
          if @_outgoing[@patternIndex].length is @index + 1
            @terminated = true
            @_outgoing[@patternIndex] = []
            @_outgoing[@patternIndex][@index + 1] = @pattern[@patternIndex].terminator.charCodeAt(0)

      # If we are reading an arrayed pattern and we have not read all of the
      # array elements, we repeat the current field type.
      if ++@index < @repeat
        @nextValue()

      # If we have written all of the packet fields, call the associated
      # callback with this parser.
      #
      # The pattern is set to null, our terminal condition, before the callback,
      # because the callback may specify a subsequent packet to parse.
      else if ++@patternIndex is @pattern.length
        @pattern = null

        if @callback?
          @callback.call @self, @

      else

        delete        @padding
        @repeat       = @pattern[@patternIndex].repeat
        @terminated   = not @pattern[@patternIndex].terminator
        @terminates   = not @terminated
        @index        = 0

        @nextField()
        @nextValue()

    @_outgoing = null

    offset - start
