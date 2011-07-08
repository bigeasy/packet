{parse}   = require "./pattern"
{Packet}  = require "./packet"
ieee754   = require "./ieee754"
stream    = require "stream"

class ReadableStream extends stream.Stream
  constructor: (@_parser, @_length) ->
  setEncoding: (encoding) ->
    @_decoder = new (require("string_decoder").StringDecoder)(encoding)
  _delegate: (method) -> @_parser.piped[method]() if @_parser.piped
  pause: ->
    @_delegate "pause"
    @_parser.paused = true
  resume: ->
    @_delegate "resume"
    @_parser.paused = false
  destroySoon: ->
    @_delegate "destroySoon"
    @_parser.piped.destroySoon() if @_parser.piped
  destroy: ->
    @_delegate "destroy"
    @aprser.destroyed = false
  _end: ->
    @emit "end"
    @_parser._stream = null
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

  data: (data...)   -> @_user = data

  getBytesRead:     -> @_bytesRead

  _nextField: ->
    pattern       = @_pattern[@_patternIndex]
    @_repeat       = pattern.repeat
    @_index        = 0
    @_skipping    = null
    @_terminated   = not pattern.terminator
    @_arrayed     = [] if pattern.arrayed and pattern.endianness isnt "x"

  _nextValue: ->
    pattern = @_pattern[@_patternIndex]

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
    pattern       = packet.pattern or parse(nameOrPattern)
    callback    or= packet.callback or null

    @_pattern      = pattern
    @_callback     = callback
    @_patternIndex = 0
    @_fields      = []

    @_nextField()
    @_nextValue()

  skip: (length, @_callback) ->
    # Create a bogus pattern to enter the parse loop where the stream is fed in
    # the skipping branch. The length is passed to the callback simply because
    # the parse loop expects there to be a field.
    @_pattern = [ {} ]
    @_terminated   = true
    @_index        = 0
    @_repeat       = 1
    @_patternIndex = 0
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
    while @_pattern != null and offset < end
      part = @_pattern[@_patternIndex]
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
            @_value[@_offset] = b
            @_offset += @_increment
            break if @_offset is @_terminal
            return @_bytesRead - start if offset is end

        # Otherwise we're packing bytes into an unsigned integer, the most
        # common case.
        else
          loop
            b = buffer[offset]
            @_bytesRead++
            offset++
            @_value += Math.pow(256, @_offset) * b
            @_offset += @_increment
            break if @_offset == @_terminal
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
        bytes = value = @_value

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
      if not @_terminated
        if part.terminator.charCodeAt(0) == value
          @_terminated = true
          if @_repeat == Number.MAX_VALUE
            @_repeat = @_index + 1
          else
            @_skipping = (@_repeat - (++@_index)) * part.bytes
            if @_skipping
              @_repeat = @_index + 1
              continue

      # If we are reading an arrayed pattern and we have not read all of the
      # array elements, we repeat the current field type.
      if ++@_index <  @_repeat
        @_nextValue()

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
            if (@_pattern[@_patternIndex + 1].repeat = value) is 0
              @_fields.push(@pipeline(part, []))
              @_patternIndex++

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
            @_pattern.splice.apply @_pattern, [ @_patternIndex, 1 ].concat(branch.pattern)
            @_nextField()
            @_nextValue()
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
        if ++@_patternIndex == @_pattern.length
          @_pattern = null

          if @_callback
            @_fields.push(this)
            @_fields.push(p) for p in @_user or []

            @_callback.apply @_self, @_fields

        # Otherwise we proceed to the next field in the packet pattern.
        else
          @_nextField()
          @_nextValue()

    # Return the number of bytes read in this iteration.
    @_bytesRead - start

  close: ->
    @emit "close"

  end: (string, encoding) ->
    @write(string, encoding) if string
    @emit "end"
