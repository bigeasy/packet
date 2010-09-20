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

  reset: ->
    @bytesRead = 0
    @bytesWritten = 0
    @pattern = null
    @callback = null

  next: (value) ->
    reading     = not value?
    pattern     = @pattern[@index]
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
    pattern = @pattern[@index]
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
    pattern = @pattern[@index]
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

  parse: (nameOrPattern, callback) ->
    packet      = @packets[nameOrPattern] or {}
    pattern     = packet.pattern or parsePattern(nameOrPattern)
    callback  or= packet.callback or noop

    @pattern    = pattern
    @callback   = callback
    @index      = 0
    @repeat     = 0

    @next()
    if @pattern[@index].arrayed
      @fields.push([])

  read: (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    b
    while @pattern != null and offset < length
      if @pattern[@index].unpacked
        loop
          b = buffer[offset]
          @bytesRead++
          offset++
          @value[@offset] = b
          @offset += @increment
          break if @offset is @terminal
          return false if offset is length
      else
        loop
          b = buffer[offset]
          @bytesRead++
          offset++
          @value += Math.pow(256, @offset) * b
          @offset += @increment
          break if @offset == @terminal
          return true if offset == length
      if @pattern[@index].arrayed
        @fields[@fields.length - 1].push(@unpack())
      else
        @fields.push(@unpack())
      if ++@repeat <  @pattern[@index].repeat
        @next()
      else if ++@index == @pattern.length
        @fields.push(this)
        for p in @user or []
          @fields.push(p)
        @callback.apply null, @fields
        @fields.length = 0
        @pattern = null
      else
        @next()
        @repeat = 0
        if @pattern[@index].arrayed
          @fields.push([])
    true

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
    @index        = 0
    @repeat       = 0
    @outgoing     = shiftable

    @next(shiftable[0])

  write: (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    while @pattern and offset < length
      if @pattern[@index].unpacked
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
      if ++@index is @pattern.length
        @callback.apply null, [ this ]
      else
        @next(@outgoing[@index])
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

