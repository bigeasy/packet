parsePattern = require("./pattern").parse
ieee754 = require "./ieee754"
stream = require "stream"

# Convert an array of bytes into an hex string, two characters for each byte.
hex = (bytes) ->
  h = bytes.map (b) ->
    if b < 10
      "0" + b.toString(16)
    else
      b.toString(16)
  h.join("")

# Default callback, when no callback is provided.
noop = (value) -> value

# Base class for `Serializer` and `Parser`.
class Packet extends stream.Stream
  # Construct a packet that sends events using the given `self` as `this`.
  constructor: (@self) ->
    @packets = {}
    @reset()
    @fields = []
    @transforms = Object.create(transforms)

  # Create a copy that will adopt the packets defined in this object, through
  # prototype inheritence. This is used to efficently create parsers and
  # serializers that can run concurrently, from a pre-configured prototype,
  # following classic GoF prototype creational pattern.
  clone: ->
    copy            = new (this.constructor)()
    copy.packets    = Object.create(packets)
    copy

  # Map a named packet with the given `name` to the given `pattern`. 
  packet: (name, pattern, callback) ->
    callback      or= noop
    pattern         = parsePattern(pattern)
    @packets[name]  = {pattern, callback}

  # Resets the bytes read, bytes written and the current pattern. Used to
  # recover from exceptional conditions and generally a good idea to call this
  # method before starting a new series of packet parsing transitions.
  reset: ->
    @bytesRead = 0
    @bytesWritten = 0
    @pattern = null
    @callback = null
    @fields = []

  pipeline: (pattern, value) ->
    # Run the piplines for parsing.
    if pattern.transforms
      for transform in pattern.transforms
        parameters = []
        for constant in transform.parameters
          parameters.push(constant)
        parameters.push(not @outgoing)
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

  unpack: ->
    bytes   = @value
    return null unless bytes?
    pattern = @pattern[@patternIndex]
    if pattern.type == "h"
      hex bytes.reverse()
    else if pattern.type == "f"
      if pattern.bits == 32
        ieee754.fromIEEE754Single(bytes)
      else
        ieee754.fromIEEE754Double(bytes)
    else if pattern.signed
      value = 0
      if (bytes[bytes.length - 1] & 0x80) == 0x80
        top = bytes.length - 1
        for i in [0...top]
          value += (~bytes[i] & 0xff)  * Math.pow(256, i)
        # ~1 == -2.
        # To get the two's compliment as a positive value you use ~1 & 0xff == 254. 
        value += (~(bytes[top] & 0x7f) & 0xff & 0x7f) * Math.pow(256, top)
        value += 1
        value *= -1
      else
        top = bytes.length - 1
        for i in [0...top]
          value += (bytes[i] & 0xff)  * Math.pow(256, i)
        value += (bytes[top] & 0x7f) * Math.pow(256, top)
      value
    else
      bytes

  pack: (value) ->
    pattern = @pattern[@patternIndex]
    if pattern.type == "f"
      if pattern.bits == 32
        ieee754.toIEEE754Single value
      else
        ieee754.toIEEE754Double value
    else
      value

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

  getBytesRead:     -> @bytesRead

  nextField: ->
    pattern       = @pattern[@patternIndex]
    @repeat       = pattern.repeat
    @index        = 0
    @_skipping    = null
    @terminated   = not pattern.terminator

    @fields.push [] if pattern.arrayed and pattern.endianness isnt "x"

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
    packet        = @packets[nameOrPattern] or {}
    pattern       = packet.pattern or parsePattern(nameOrPattern)
    callback    or= packet.callback or noop

    @pattern      = pattern
    @callback     = callback
    @patternIndex = 0
    @fields       = []

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
    @fields = [ length ]

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
    start    = @bytesRead
    end      = offset + length

    # We set the pattern to null when all the fields have been read, so while
    # there is a pattern to fill and bytes to read.
    b
    while @pattern != null and offset < end
      if @_skipping?
        advance      = Math.min(@_skipping, end - offset)
        begin        = offset
        offset      += advance
        @_skipping  -= advance
        @bytesRead  += advance
        if @_stream
          @_stream._write(buffer.slice(begin, begin + advance)) if advance
          @_stream._end() if not @_skipping
        if @_skipping
          return @bytesRead - start
        else
          @_skipping = null

      else
        # If the pattern is unpacked, the value we're populating is an array.
        if @pattern[@patternIndex].unpacked
          loop
            b = buffer[offset]
            @bytesRead++
            offset++
            @value[@offset] = b
            @offset += @increment
            break if @offset is @terminal
            return @bytesRead - start if offset is end

        # If we are parsing an array, and repeat is 0
        # It is essentially an empty array
        # We don't parse anything
        else if @pattern[@patternIndex].arrayed and @pattern[@patternIndex].repeat == 0
          @value = null
          @terminated = true

        # Otherwise we're packing bytes into an unsigned integer, the most
        # common case.
        else
          loop
            b = buffer[offset]
            @bytesRead++
            offset++
            @value += Math.pow(256, @offset) * b
            @offset += @increment
            break if @offset == @terminal
            return @bytesRead - start if offset is end

        # Unpack the field value.
        field = @unpack()

        # If we are filling an array field the current fields is an array,
        # otherwise current field is the value we've just read.
        if @pattern[@patternIndex].arrayed
          @fields[@fields.length - 1].push(field) if field?
        else
          @fields.push(field)


      # If we've not yet hit our terminator, check for the terminator. If we've
      # hit the terminator, and we do not have a maximum size to fill, then
      # terminate by setting up the array to terminate.
      if not @terminated
        if @pattern[@patternIndex].terminator.charCodeAt(0) == field
          @terminated = true
          if @repeat == Number.MAX_VALUE
            @repeat = @index + 1
          else
            @_skipping = (@repeat - (++@index)) * @pattern[@patternIndex].bytes
            if @_skipping
              @repeat = @index + 1
              continue

      # If we are reading an arrayed pattern and we have not read all of the
      # array elements, we repeat the current field type.
      if ++@index <  @repeat
        @nextValue()

      # If we have read all of the pattern fields, call the associated callback.
      # We add the parser and the user suppilied additional arguments onto the
      # callback arguments.
      #
      # The pattern is set to null, our terminal condition, because the callback
      # may specify a subsequent packet to parse.
      else if ++@patternIndex == @pattern.length
        @fields.push(@pipeline(@pattern[@patternIndex - 1 ], @fields.pop()))

        @fields.push(this)
        for p in @user or []
          @fields.push(p)

        @pattern = null

        @callback.apply @self, @fields

      # Otherwise we proceed to the next field in the packet pattern.
      else
        if @pattern[@patternIndex - 1].endianness isnt "x"
          if @pattern[@patternIndex - 1].length
            @pattern[@patternIndex].repeat = @fields.pop()
          else
            @fields.push(@pipeline(@pattern[@patternIndex - 1], @fields.pop()))

        @nextField()
        @nextValue()

    @bytesRead - start

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
    @_serializer._write buffer
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
    for part in @packets[name].pattern
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
      @outgoing.splice @patternIndex, 0, null
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
        value = @outgoing[@patternIndex][@index]
      else
        if pattern.length
          repeat = @outgoing[@patternIndex].length
          @outgoing.splice @patternIndex, 0, repeat
          @pattern[@patternIndex + 1].repeat = repeat
        value = @outgoing[@patternIndex]
      if pattern.unpacked
        value = @pack(value)

      super value

  stream: (length) ->
    @_stream = new WritableStream(length, @)

  skip: (length, fill) ->
    while length
      size = Math.min(length, @_buffer.length)
      length -= size
      for i in [0...size]
        @_buffer[i] = fill
      @_write @_buffer.slice 0, size

  serialize: (shiftable...) ->
    if typeof shiftable[shiftable.length - 1] == 'function'
      callback = shiftable.pop()

    nameOrPattern = shiftable.shift()
    packet        = @packets[nameOrPattern] or {}
    pattern       = packet.pattern or parsePattern(nameOrPattern)
    callback    or= packet.callback or noop

    if not packet.pattern
      for part in pattern
        if part.transforms
          part.transforms.reverse()

    @pattern      = pattern
    @callback     = callback
    @patternIndex = 0
    @outgoing     = shiftable

    for value, i in @outgoing
      @outgoing[i] = @pipeline(pattern[i], value)

    @nextField()
    @nextValue()

    # Implementing pause requires callbacks.
    if @streaming
      while @pattern
        read = @write(@_buffer, 0, @_buffer.length)
        @_write @_buffer.slice 0, read

  _write: (slice) ->
    if @_decoder
      string = @_decoder.write(slice)
      @emit "data", string if string.length
    else
      @emit "data", slice

  close: ->
    @emit "end"

##### serializer.write(buffer[, offset][, length])
# The `write` method writes to the buffer, returning when the current pattern is
# written, or the end of the buffer is reached.

  # Write to the `buffer` in the region defined by the given `offset` and `length`.
  write: (buffer, offset, length) ->
    offset  or= 0
    length  or= buffer.length
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
          if @outgoing[@patternIndex].length is @index + 1
            @terminated = true
            @outgoing[@patternIndex] = []
            @outgoing[@patternIndex][@index + 1] = @pattern[@patternIndex].terminator.charCodeAt(0)

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
        @callback.apply @self, [ this ]

      else

        delete        @padding
        @repeat       = @pattern[@patternIndex].repeat
        @terminated   = not @pattern[@patternIndex].terminator
        @terminates   = not @terminated
        @index        = 0

        @nextField()
        @nextValue()

    @outgoing = null

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
