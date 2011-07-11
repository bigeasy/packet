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
    @_streaming = false

  getBytesWritten: -> @_bytesWritten

  packet: (name, pattern, callback) ->
    super name, pattern, callback
    for part in @_packets[name].pattern
      if part.transforms
        part.transforms.reverse()

  _nextField: ->
    pattern       = @_pattern[@_patternIndex]
    @_repeat      = pattern.repeat
    @_terminated  = not pattern.terminator
    @_terminates  = not @_terminated
    @_index       = 0

    delete        @_padding

    if pattern.endianness is "x"
      @_outgoing.splice @_patternIndex, 0, null
      if pattern.padding?
        @_padding = pattern.padding

  # Setup the next field in the current pattern to read or write.
  _nextValue: ->
    pattern = @_pattern[@_patternIndex]

    if pattern.endianness is "x" and not @_padding?
        @_skipping = pattern.bytes
    else
      if @_padding?
        value = @_padding
      else if pattern.arrayed
        value = @_outgoing[@_patternIndex][@_index]
      else if packing = pattern.packing
        count   = 0
        value   = 0
        length  = pattern.bits
        for pack, i in packing
          length -= pack.bits
          if pack.endianness is "b"
            unpacked = @_outgoing[@_patternIndex + count++]
            if pack.signed
              range = Math.pow(2, pack.bits - 1)
              unless (-range) <= unpacked and unpacked <= range - 1
                throw new Error "value #{unpacked} will not fit in #{pack.bits} bits"
              if unpacked < 0
                mask = range * 2 - 1
                unpacked = (~(- unpacked) + 1) & mask
            value += unpacked * Math.pow(2, length)
        @_outgoing.splice @_patternIndex, count, value
      else
        if pattern.lengthEncoding
          repeat = @_outgoing[@_patternIndex].length
          @_outgoing.splice @_patternIndex, 0, repeat
          @_pattern[@_patternIndex + 1].repeat = repeat
        value = @_outgoing[@_patternIndex]
      if pattern.unpacked
        value = @_pack(value)

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
    @_callback = null

    read = 0
    while @_pattern
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
      callback.call @_self, slice

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
      @_callback = null
      while @_pattern
        read = @_serialize(@_buffer, 0, @_buffer.length)
        @write @_buffer.slice 0, read
      callback.call @_self

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

    @_pattern      = pattern
    @_callback     = null
    @_patternIndex = 0

    if shiftable.length is 1 and
        typeof shiftable[0] is "object" and
        not (shiftable[0] instanceof Array)
      object = shiftable.shift()
      @_outgoing = []
      for part in @_pattern
        @_outgoing.push if part.name then object[part.name] else null
    else
      @_outgoing  = shiftable

    # Run the outgoing values through field pipelines before we enter the write
    # loop. We need to skip over the blank fields and constants. We also skip
    # over bit packed feilds because we do not apply pipelines to packed fields.
    skip = 0
    j = 0
    for value, i in @_outgoing
      if skip
        skip--
        continue
      if pattern[j].packing
        for pack in pattern[j].packing
          if pack.endianness is "b"
            skip++
        if skip > 0
          skip--
      else
        j++ while pattern[j] and pattern[j].endianness is "x"
        if not pattern[j]
          throw new Error "too many fields"
        @_outgoing[i] = @pipeline(pattern[j], value)
      j++

    @_nextField()
    @_nextValue()

    callback

  close: ->
    @emit "end"

  _pack: (value) ->
    pattern = @_pattern[@_patternIndex]
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
    while @_pattern and offset < end
      if @_skipping
        advance         = Math.min(@_skipping, end - offset)
        offset         += advance
        @_skipping      -= advance
        @_bytesWritten  += advance
        return offset - start if @_skipping

      else
        # If the pattern is unpacked, the value we're writing is an array.
        if @_pattern[@_patternIndex].unpacked
          loop
            buffer[offset] = @_value[@_offset]
            @_offset += @_increment
            @_bytesWritten++
            offset++
            break if @_offset is @_terminal
            return offset - start if offset is end

        # Otherwise we're unpacking bytes of an unsigned integer, the most common
        # case.
        else
          loop
            buffer[offset] = Math.floor(@_value / Math.pow(256, @_offset)) & 0xff
            @_offset += @_increment
            @_bytesWritten++
            offset++
            break if @_offset is @_terminal
            return offset - start if offset is end

      # If we have not terminated, check for the termination state change.
      # Termination will change the loop settings.
      if @_terminates
        if @_terminated
          if @_repeat is Number.MAX_VALUE
            @_repeat = @_index + 1
          else if @_pattern[@_patternIndex].padding?
            @_padding = @_pattern[@_patternIndex].padding
          else
            @_skipping = (@_repeat - (++@_index)) * @_pattern[@_patternIndex].bytes
            if @_skipping
              @_repeat = @_index + 1
              continue
        else
          # If we are at the end of the series, then we create an empty outgoing
          # array to hold the terminator, because the outgoing series may be a
          # buffer. We insert the terminator at next index in the outgoing array.
          # We then set repeat to allow one more iteration before callback.
          if @_outgoing[@_patternIndex].length is @_index + 1
            @_terminated = true
            @_outgoing[@_patternIndex] = []
            @_outgoing[@_patternIndex][@_index + 1] = @_pattern[@_patternIndex].terminator.charCodeAt(0)

      # If we are reading an arrayed pattern and we have not read all of the
      # array elements, we repeat the current field type.
      if ++@_index < @_repeat
        @_nextValue()

      # If we have written all of the packet fields, call the associated
      # callback with this parser.
      #
      # The pattern is set to null, our terminal condition, before the callback,
      # because the callback may specify a subsequent packet to parse.
      else if ++@_patternIndex is @_pattern.length
        @_pattern = null

        if @_callback?
          @_callback.call @_self, @

      else

        delete        @_padding
        @_repeat      = @_pattern[@_patternIndex].repeat
        @_terminated  = not @_pattern[@_patternIndex].terminator
        @_terminates  = not @_terminated
        @_index       = 0

        @_nextField()
        @_nextValue()

    @_outgoing = null

    offset - start
