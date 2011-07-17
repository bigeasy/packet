# Require the necessary Packet sibling modules.
{parse}   = require "./pattern"
ieee754   = require "./ieee754"
{Packet}  = require "./packet"

# The `Serializer` writes JavaScript primitives to a stream in binary
# representations.
class exports.Serializer extends Packet
  # Construct a `Serializer` that will use the given `self` object as the `this`
  # when a callback is called. If no `self` is provided, the `Serializer`
  # instance will be used as the `this` object for serialization event
  # callbacks.
  constructor: (self) ->
    super self
    @readable = true
    @_buffer = new Buffer(1024)
    @_streaming = false

  # Get the number of bytes written since the last call to `@reset()`.
  getBytesWritten: -> @_bytesWritten

  # Initialize the next field pattern in the serialization pattern array, which
  # is the pattern in the array `@_pattern` at the current `@_patternIndex`.
  # This initializes the serializer to write the next field.
  _nextField: ->
    pattern       = @_pattern[@_patternIndex]
    @_repeat      = pattern.repeat
    @_terminated  = not pattern.terminator
    @_terminates  = not @_terminated
    @_index       = 0

    delete        @_padding

    # Can't I keep separate indexes? Do I need that zero?
    if pattern.endianness is "x"
      @_outgoing.splice @_patternIndex, 0, null
      if pattern.padding?
        @_padding = pattern.padding

  # Initialize the next field value to serialize. In the case of an arrayed
  # value, we will use the next value in the array. This method will adjust the
  # pattern for alteration. It will back a bit packed integer. It will covert
  # the field to a byte array for floats and signed negative numbers.
  _nextValue: ->
    pattern = @_pattern[@_patternIndex]
  
    # If we are skipping without filling we note the count of bytes to skip.
    if pattern.endianness is "x" and not @_padding?
      @_skipping = pattern.bytes

    # If the pattern is an alternation, we use the current value to determine
    # with alternate to apply. We then update the pattern array with pattern of
    # the matched alternate, and rerun the next field and next value logic.
    else if pattern.alternation
      value = @_outgoing[@_patternIndex]
      for alternate in pattern.alternation
        if alternate.write.minimum <= value and value <= alternate.write.maximum
          @_pattern.splice.apply @_pattern, [ @_patternIndex, 1 ].concat(alternate.pattern)
          break
      if alternate.failed
        throw new Error "Cannot match alternation."
      @_nextField()
      @_nextValue()

    # Otherwise, we've got a value to write here and now.
    else
      # If we're filling, we write the fill value.
      if @_padding?
        value = @_padding

      # If the field is arrayed, we get the next value in the array.
      else if pattern.arrayed
        value = @_outgoing[@_patternIndex][@_index]

      # If the field is bit packed, we update the `@_outgoing` array of values
      # by packing zero, one or more values into a single value. We will also
      # check for bits filled with a pattern specified filler value and pack
      # that in there as well.
      else if packing = pattern.packing
        count   = 0
        value   = 0
        length  = pattern.bits
        for pack, i in packing
          length -= pack.bits
          if pack.endianness is "b" or pack.padding?
            unpacked = if pack.padding? then pack.padding else @_outgoing[@_patternIndex + count++]
            if pack.signed
              range = Math.pow(2, pack.bits - 1)
              unless (-range) <= unpacked and unpacked <= range - 1
                throw new Error "value #{unpacked} will not fit in #{pack.bits} bits"
              if unpacked < 0
                mask = range * 2 - 1
                unpacked = (~(- unpacked) + 1) & mask
            value += unpacked * Math.pow(2, length)
        @_outgoing.splice @_patternIndex, count, value

      # If the current field is a length encoded array, then the length of the
      # the current array value is the next value, otherwise, we have the
      # simple case, the value is the current value.
      else
        if pattern.lengthEncoding
          repeat = @_outgoing[@_patternIndex].length
          @_outgoing.splice @_patternIndex, 0, repeat
          @_pattern[@_patternIndex + 1].repeat = repeat
        value = @_outgoing[@_patternIndex]

      # If the array is not an unsigned integer, we might have to convert it.
      if pattern.unpacked
        # Convert a float into its IEEE 754 representation.
        if pattern.type == "f"
          if pattern.bits == 32
            value = ieee754.toIEEE754Single value
          else
            value = ieee754.toIEEE754Double value
        # Convert a signed integer into its two's complient representation.
        else if pattern.signed
          copy = Math.abs(value)
          bytes = []
          # FIXME If the value is greater than zero, we can just change the
          # pattern to packed.
          for i in [0...pattern.bytes]
            pow = Math.pow(256, i)
            bytes[i] = Math.floor(copy / pow % (pow * 256))
          if value < 0
            carry = 1
            for i in [0...bytes.length]
              bytes[i] = (~bytes[i] & 0xff) + carry
              if bytes[i] is 256
                bytes[i] = 0
              else
                carry = 0
          value = bytes

      super value

  # Create a `WritableStream` to write the bytes directly to the output stream.
  # The `WritableStream.write` method must be invoked with exactly `length`
  # bytes. FIXME You really can change the meaning of `end` to skip the last
  # part, just use skip.
  stream: (length) ->
    @_stream = new (require("./writable").WritableStream)(length, @)

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

  # Skip a region of the given `length` in the output stream, filling it with
  # the given `fill` byte.
  skip: (length, fill) ->
    while length
      size = Math.min(length, @_buffer.length)
      length -= size
      for i in [0...size]
        @_buffer[i] = fill
      @write @_buffer.slice 0, size


  ##### serializer.buffer([buffer, ]values...[, callback])

  # Serialize output to a `Buffer` or an `Array`. The first argument is the
  # `Buffer` or `Array` to use. If omitted, the `@_buffer` member of the
  # serializer will be used. The optional `callback` will be invoked using the
  # flexiable `this` object, with the buffer as the sole argument.
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

  ##### serializer._reset(nameOrPattern, values...[, callback])

  # Resets the `Seriailzer` to write fields to stream or to buffer using the
  # given compiled pattern name or uncompiled pattern.
  #
  # FIXME: We've already used `reset`, so we need to rename this.
  _reset: (shiftable) ->
    if typeof shiftable[shiftable.length - 1] == 'function'
      callback = shiftable.pop()

    # FIXME This is common to `Parser`, so put it in `Packet`.
    nameOrPattern = shiftable.shift()
    if packet = @_packets[nameOrPattern]
      pattern    = packet.pattern.slice 0
      callback or= packet.callback or null
    else
      pattern    = parse(nameOrPattern)

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
        @_outgoing[i] = @_pipeline(pattern[j], value, true)
      j++

    @_nextField()
    @_nextValue()

    callback

  ##### serializer.close()

  # Close the underlying output stream.
  close: ->
    @emit "end"

  ##### serializer.write(buffer[, offset][, length])

  # The `write` method writes to the buffer, returning when the current pattern
  # is written, or the end of the buffer is reached.  Write to the `buffer` in
  # the region defined by the given `offset` and `length`.
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
            terminator = @_pattern[@_patternIndex].terminator
            for char, i in terminator
              @_outgoing[@_patternIndex][@_index + 1 + i] = char

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
