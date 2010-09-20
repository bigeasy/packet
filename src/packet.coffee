parsePattern = require('./pattern').parse
ieee754 = require('./ieee754')

hex = (bytes) ->
  h = bytes.map (b) ->
    if b < 10
      "0" + b.toString(16)
    else
      b.toString(16)
  h.join("")

noop = (value) -> value

class Packet
  constructor: ->
    @packets = {}
    @reset()
    @fields = []

  clone: ->
    copy            = new (this.constructor)()
    copy.packets    = Object.create(packets)
    copy

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

  # Setup the next field in the current pattern to read or write.
  next: (value) ->
    reading     = not value?
    pattern     = @pattern[@patternIndex]
    little      = pattern.endianness == 'l'
    bytes       = pattern.bytes

    if pattern.unpacked
      if reading
        value = []
      else
        value = @pack(value)
    else if reading
      value = 0

    @value      = value
    @offset     = if little then 0 else bytes - 1
    @increment  = if little then 1 else -1
    @terminal   = if little then bytes else -1

  unpack: ->
    bytes   = @value
    pattern = @pattern[@patternIndex]
    if pattern.type == "h"
      return hex bytes.reverse()
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

module.exports.Parser = class Parser extends Packet
  data: (data...)   -> @user = data

  getBytesRead:     -> @bytesRead

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
    @repeat       = pattern[0].repeat
    @skipping     = 0
    @index        = 0
    @terminated   = !@pattern[0].terminator

    @next()
    if @pattern[@patternIndex].arrayed
      @fields.push([])

##### packet.read(buffer[, offset][, length])
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
      if @skipping
        advance      = Math.min(@skipping, end - offset)
        console.log("ADVANCE: " + advance + " " + @skipping)
        offset      += advance
        @skipping   -= advance
        @bytesRead  += advance
        return @bytesRead - start if @skipping

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

        # Otherwise we're packing bytes into an unsigned integer, the most common
        # case.
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
          @fields[@fields.length - 1].push(field)
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
            @skipping = (@repeat - (++@index)) * @pattern[@patternIndex].bytes
            @repeat = @index + 1
            continue

      # If we are reading an arrayed pattern and we have not read all of the
      # array elements, we repeat the current field.
      if ++@index <  @repeat
        @next()

      # If we have read all of the pattern fields, call the associated callback.
      # We add the parser and the user suppilied additional arguments onto the
      # callback arguments.
      #
      # The pattern is set to null, our terminal condition, before the callback,
      # because the callback may specify a subsequent packet to parse.
      else if ++@patternIndex == @pattern.length

        @fields.push(this)
        for p in @user or []
          @fields.push(p)

        @pattern        = null

        @callback.apply null, @fields

        @fields.length  = 0

      # Otherwise we proceed to the next field in the packet pattern.
      else
        @next()
        @repeat       = @pattern[@patternIndex].repeat
        @index        = 0
        @skipping     = 0
        @terminated   = !@pattern[@patternIndex].terminator
        if @pattern[@patternIndex].arrayed
          @fields.push([])

    @bytesRead - start

module.exports.Serializer = class Serializer extends Packet
  getBytesWritten: -> @bytesWritten

  serialize: (shiftable...) ->
    if typeof shiftable[shiftable.length - 1] == 'function'
      callback = shiftable.pop()

    nameOrPattern = shiftable.shift()
    packet        = @packets[nameOrPattern] or {}
    pattern       = packet.pattern or parsePattern(nameOrPattern)
    callback    or= packet.callback or noop

    @pattern      = pattern
    @callback     = callback
    @patternIndex = 0
    @repeat       = pattern[@patternIndex].repeat
    @element      = 0
    @outgoing     = shiftable

    @next(shiftable[0])

  write: (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    while @pattern and offset < length
      if @pattern[@patternIndex].unpacked
        loop
          buffer[offset] = @value[@offset]
          @offset += @increment
          @bytesWritten++
          offset++
          break if @offset is @terminal
          return true if offset is length
      else
        loop
          buffer[offset] = Math.floor(@value / Math.pow(256, @offset)) & 0xff
          @offset += @increment
          @bytesWritten++
          offset++
          break if @offset is @terminal
          return true if offset is length
      if ++@patternIndex is @pattern.length
        @callback.apply null, [ this ]
      else
        @next(@outgoing[@patternIndex])
    true

module.exports.Structure = class Structure
  constructor: (pattern) ->
    @parser = new Parser()
    @parser.packet("structure", pattern)

    @serializer = new Serializer()
    @serializer.packet("structure", pattern)

  sizeOf: (values...) -> 0

  read: (buffer, offset, callback) ->
    callback = offset if typeof callback is "function" and not callback?
    @parser.reset()
    @parser.parse("structure", callback)
    @parser.read(buffer, offset, Number.MAX_VALUE)

  write: (values...) ->
    buffer = values.shift()

