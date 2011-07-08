parsePattern = require("./pattern").parse
ieee754 = require "./ieee754"
stream = require "stream"

# Default callback, when no callback is provided.
noop = (value) -> value

# Base class for `Serializer` and `Parser`.
class Packet extends stream.Stream
  # Construct a packet that sends events using the given `self` as `this`.
  constructor: (@self) ->
    @_packets = {}
    @reset()
    @_fields = []
    @transforms = Object.create(transforms)

  # Create a copy that will adopt the packets defined in this object, through
  # prototype inheritence. This is used to efficently create parsers and
  # serializers that can run concurrently, from a pre-configured prototype,
  # following classic GoF prototype creational pattern.
  #
  # FIXME Test me.
  clone: ->
    copy            = new (@.constructor)()
    copy._packets   = Object.create(@_packets)
    copy

  # Map a named packet with the given `name` to the given `pattern`. 
  packet: (name, pattern, callback) ->
    callback      or= noop
    pattern         = parsePattern(pattern)
    @_packets[name] = {pattern, callback}

  # Resets the bytes read, bytes written and the current pattern. Used to
  # recover from exceptional conditions and generally a good idea to call this
  # method before starting a new series of packet parsing transitions.
  reset: ->
    @_bytesRead = 0
    @bytesWritten = 0
    @pattern = null
    @callback = null
    @_fields = []

  # Excute the pipeline of transforms for the `pattern` on the `value`.
  pipeline: (pattern, value) ->
    # Run the piplines for parsing.
    if pattern.transforms
      for transform in pattern.transforms
        parameters = []
        for constant in transform.parameters
          parameters.push(constant)
        parameters.push(not @_outgoing)
        parameters.push(pattern)
        parameters.push(value)
        value = @transforms[transform.name].apply null, parameters
    value

  # Setup the next field in the current pattern to read or write.
  nextValue: (value) ->
    pattern     = @pattern[@patternIndex]
    little      = pattern.endianness == 'l'
    bytes       = pattern.bytes

    @value      = value
    @offset     = if little then 0 else bytes - 1
    @increment  = if little then 1 else -1
    @terminal   = if little then bytes else -1

bufferize = (array) ->
  buffer = new Buffer(array.length)
  for b, i in array
    buffer[i] = b
  buffer

transforms =
  str: (encoding, parsing, field, value) ->
    if parsing
      if not (value instanceof Buffer)
        value = bufferize(value)
      if /^ascii$/i.test(encoding)
        # Broken and waiting on [297](http://github.com/ry/node/issues/issue/297).
        # If the top bit is set, it is not ASCII, so we zero the value.
        for i in [0...value.length]
          value[i] = 0 if value[i] & 0x80
        encoding = "utf8"
      length = value.length
      length -= field.terminator.length if field.terminator
      value.toString(encoding, 0, length)
    else
      if field.terminator
        value += field.terminator
      buffer = new Buffer(value, encoding)
      if encoding is "ascii"
        for i in [0...buffer.length]
          buffer[i] = 0 if value.charAt(i) is '\0'
      buffer

  ascii: (parsing, field, value) ->
    transforms.str("ascii", parsing, field, value)

  utf8: (parsing, field, value) ->
    transforms.str("utf8", parsing, field, value)

  pad: (character, length, parsing, field, value) ->
    if not parsing
      while value.length < length
        value = character + value
    value

  atoi: (base, parsing, field, value) ->
    if parsing then parseInt(value, base) else value.toString(base)

  atof: (parsing, field, value) ->
    if parsing then parseFloat(value) else value.toString()

class ReadableStream extends stream.Stream
  constructor: (@parser, @length) ->
  setEncoding: (encoding) ->
    @_decoder = new (require("string_decoder").StringDecoder)(encoding)
  _delegate: (method) -> @parser.piped[method]() if @parser.piped
  pause: ->
    @_delegate "pause"
    @parser.paused = true
  resume: ->
    @_delegate "resume"
    @parser.paused = false
  destroySoon: ->
    @_delegate "destroySoon"
    @parser.piped.destroySoon() if @parser.piped
  destroy: ->
    @_delegate "destroy"
    @aprser.destroyed = false
  _end: ->
    @emit "end"
    @parser._stream = null
  _write: (slice) ->
    if @_decoder
      string = @_decoder.write(slice)
      @emit "data", string if string.length
    else
      @emit "data", slice

module.exports.Parser = class Parser extends Packet
  constructor: (self) ->
    super self
    @writable = true

  data: (data...)   -> @user = data

  getBytesRead:     -> @_bytesRead

  nextField: ->
    pattern       = @pattern[@patternIndex]
    @repeat       = pattern.repeat
    @index        = 0
    @_skipping    = null
    @terminated   = not pattern.terminator
    @_arrayed     = [] if pattern.arrayed and pattern.endianness isnt "x"

  nextValue: ->
    pattern = @pattern[@patternIndex]

    if pattern.endianness is "x"
      @_skipping  = pattern.bytes
    else
      little      = pattern.endianness == "l"
      bytes       = pattern.bytes

      if pattern.unpacked
        value = []
      else
        value = 0

      super value

  # Set the next packet to parse by providing a named packet name or a packet
  # pattern, with an optional `callback`. The optional `callback` will override
  # the callback assigned to a named pattern.
  parse: (nameOrPattern, callback) ->
    packet        = @_packets[nameOrPattern] or {}
    pattern       = packet.pattern or parsePattern(nameOrPattern)
    callback    or= packet.callback or noop

    @pattern      = pattern
    @callback     = callback
    @patternIndex = 0
    @_fields      = []

    @nextField()
    @nextValue()

  skip: (length, @callback) ->
    # Create a bogus pattern to enter the parse loop where the stream is fed in
    # the skipping branch. The length is passed to the callback simply because
    # the parse loop expects there to be a field.
    @pattern = [ {} ]
    @terminated   = true
    @index        = 0
    @repeat       = 1
    @patternIndex = 0
    @_fields      = []

    @_skipping = length

  # Construct a readable stream for the next length bytes calling callback when
  # they have been read.
  stream: (length, callback) ->
    @skip(length, callback)
    @_stream = new ReadableStream(@, length, callback)
    
  write: (buffer, encoding) ->
    if typeof buffer is "string"
      buffer = new Buffer(buffer, encoding or "utf8")
    @read(buffer, 0, buffer.length)

##### parser.read(buffer[, offset][, length])
# The `read` method reads from the buffer, returning when the current pattern is
# read, or the end of the buffer is reached.

  # Read from the `buffer` for the given `offset` and length.
  read: (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    start    = @_bytesRead
    end      = offset + length

    # We set the pattern to null when all the fields have been read, so while
    # there is a pattern to fill and bytes to read.
    b
    while @pattern != null and offset < end
      part = @pattern[@patternIndex]
      if @_skipping?
        advance      = Math.min(@_skipping, end - offset)
        begin        = offset
        offset      += advance
        @_skipping  -= advance
        @_bytesRead += advance
        if @_stream
          @_stream._write(buffer.slice(begin, begin + advance)) if advance
          @_stream._end() if not @_skipping
        if @_skipping
          return @_bytesRead - start
        else
          @_skipping = null

      else
        # If the pattern is unpacked, the value we're populating is an array.
        if part.unpacked
          loop
            b = buffer[offset]
            @_bytesRead++
            offset++
            @value[@offset] = b
            @offset += @increment
            break if @offset is @terminal
            return @_bytesRead - start if offset is end

        # Otherwise we're packing bytes into an unsigned integer, the most
        # common case.
        else
          loop
            b = buffer[offset]
            @_bytesRead++
            offset++
            @value += Math.pow(256, @offset) * b
            @offset += @increment
            break if @offset == @terminal
            return @_bytesRead - start if offset is end

        # Unpack the field value. Perform our basic transformations. That is,
        # convert from a byte array to a JavaScript primitive, or turn a byte
        # array into a hex string.
        #
        # Resist the urge to implement these conversions with pipelines. It
        # keeps occuring to you, but those transitions are at a higher level of
        # abstraction, primairly for operations on gathered byte arrays. These
        # transitions need to take place immediately to populate those arrays.

        # By default, value is as it is.
        bytes = value = @value

        # Create a hex string.
        if part.type == "h"
          bytes.reverse()
          hex = bytes.map (b) -> (b >> 4).toString(16) + (b & 0x0f).toString(16)
          value = hex.join("")

        # Convert to float or double.
        else if part.type == "f"
          if part.bits == 32
            value = ieee754.fromIEEE754Single(bytes)
          else
            value = ieee754.fromIEEE754Double(bytes)

        # Get the two's compliment signed value. 
        else if part.signed
          value = 0
          if (bytes[bytes.length - 1] & 0x80) == 0x80
            top = bytes.length - 1
            for i in [0...top]
              value += (~bytes[i] & 0xff) * Math.pow(256, i)
            # To get the two's compliment as a positive value you use
            # `~1 & 0xff == 254`. For exmaple: `~1 == -2`.
            value += (~(bytes[top] & 0x7f) & 0xff & 0x7f) * Math.pow(256, top)
            value += 1
            value *= -1
          else
            top = bytes.length - 1
            for i in [0...top]
              value += (bytes[i] & 0xff)  * Math.pow(256, i)
            value += (bytes[top] & 0x7f) * Math.pow(256, top)

        # If the current field is arrayed, we keep track of the array we're
        # building after a pause through member variable.
        @_arrayed.push(value) if part.arrayed

      # If we've not yet hit our terminator, check for the terminator. If we've
      # hit the terminator, and we do not have a maximum size to fill, then
      # terminate by setting up the array to terminate.
      #
      # A maximum length value means to repeat until the terminator, but a
      # specific length value means that the zero terminated string occupies a
      # field that has a fixed length, so we need to skip the used bytes.
      if not @terminated
        if part.terminator.charCodeAt(0) == value
          @terminated = true
          if @repeat == Number.MAX_VALUE
            @repeat = @index + 1
          else
            @_skipping = (@repeat - (++@index)) * part.bytes
            if @_skipping
              @repeat = @index + 1
              continue

      # If we are reading an arrayed pattern and we have not read all of the
      # array elements, we repeat the current field type.
      if ++@index <  @repeat
        @nextValue()

      # Otherwise, we've got a complete field value, either a JavaScript
      # primitive or raw bytes as an array or hex string.
      else

        # Push the field value after running it through the pipeline.
        if part.endianness isnt "x"

          # If the field is a packed field, unpack the values and push them onto
          # the field list.
          if packing = part.packing
            for pack, i in packing
              if pack.endianness is "b"
                sum = 0
                for j in [(i + 1)...packing.length]
                  sum += packing[j].bits
                unpacked = Math.floor(value / Math.pow(2, sum))
                unpacked = unpacked % Math.pow(2, pack.bits)
                @_fields.push(unpacked)

          # If the value is a length encoding, we set the repeat value for the
          # subsequent array of values. If we have a zero length encoding, we
          # push an empty array through the pipeline, and skip the repeated type.
          else if part.lengthEncoding
            if (@pattern[@patternIndex + 1].repeat = value) is 0
              @_fields.push(@pipeline(part, []))
              @patternIndex++

          # If the value is used as a switch for an alternation, we run through
          # the different possible branches, updating the pattern with the
          # pattern of the first branch that matches. We then re-read the bytes
          # used to determine the conditional outcome.
          else if part.alternation
            unless part.signed
              value = (Math.pow(256, i) * b for b, i in @_arrayed)
            for branch in part.alternation
              break if branch.read.minimum <= value and
                       value <= branch.read.maximum and
                       (value & branch.read.mask) is branch.read.mask
            if branch.failed
              throw new Error "Cannot match branch."
            bytes = @_arrayed.slice(0)
            @_bytesRead -= bytes.length
            @pattern.splice.apply @pattern, [ @patternIndex, 1 ].concat(branch.pattern)
            @nextField()
            @nextValue()
            @read bytes, 0, bytes.length
            continue

          # Otherwise, the value is what it is, so run it through the user
          # supplied tranformation pipeline, and push it onto the list of fields.
          else
            value = @_arrayed if part.arrayed
            @_fields.push(@pipeline(part, value))

        # If we have read all of the pattern fields, call the associated
        # callback.  We add the parser and the user suppilied additional
        # arguments onto the callback arguments.
        #
        # The pattern is set to null, our terminal condition, because the
        # callback may specify a subsequent packet to parse.
        if ++@patternIndex == @pattern.length
          @_fields.push(this)
          @_fields.push(p) for p in @user or []

          @pattern = null

          @callback.apply @self, @_fields

        # Otherwise we proceed to the next field in the packet pattern.
        else
          @nextField()
          @nextValue()

    # Return the number of bytes read in this iteration.
    @_bytesRead - start

  close: ->
    @emit "close"

  end: (string, encoding) ->
    @write(string, encoding) if string
    @emit "end"

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
  

module.exports.Serializer = class Serializer extends Packet
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
    @callback = noop

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
      @callback = noop
      while @pattern
        read = @_serialize(@_buffer, 0, @_buffer.length)
        @write @_buffer.slice 0, read
      callback.call @self

  _reset: (shiftable) ->
    if typeof shiftable[shiftable.length - 1] == 'function'
      callback = shiftable.pop()

    nameOrPattern = shiftable.shift()
    packet        = @_packets[nameOrPattern] or {}
    pattern       = packet.pattern or parsePattern(nameOrPattern)
    callback    or= packet.callback or noop

    if not packet.pattern
      for part in pattern
        if part.transforms
          part.transforms.reverse()

    @pattern      = pattern
    @callback     = noop
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
        @callback.call @self, this

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

module.exports.Structure = class Structure
  constructor: (pattern) ->
    @parser = new Parser()
    @parser.packet("structure", pattern)

    @serializer = new Serializer()
    @serializer.packet("structure", pattern)

  sizeOf: (values...) -> 0

  read: (buffer, offset, callback) ->
    callback = offset if typeof offset is "function" and not callback
    @parser.reset()
    @parser.parse("structure", callback)
    @parser.read(buffer, offset, Number.MAX_VALUE)

  write: (values...) ->
    buffer = values.shift()
