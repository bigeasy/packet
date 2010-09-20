parsePattern = require('./pattern').parse
ieee754 = require('./ieee754')

hex = (bytes) ->
  h = bytes.map (b) ->
    if b < 10
      "0" + b.toString(16)
    else
      b.toString(16)
  h.join("")

class Machine
  constructor: (@pattern, @callback) ->
    @index = 0

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
    bytes =  @value
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
    @machine = null

module.exports.Parser = class Parser extends Packet
  data: (data...)   -> @user = data

  getBytesRead:     -> @bytesRead

  parse: (nameOrPattern, callback) ->
    packet      = @packets[nameOrPattern] or {}
    pattern     = packet.pattern or parsePattern(nameOrPattern)
    callback  or= packet.callback or noop
    @machine    = new Machine pattern, callback

    @machine.next()

  read: (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    machine   = @machine
    b
    while @machine != null and offset < length
      if machine.pattern[machine.index].unpacked
        loop
          b = buffer[offset]
          @bytesRead++
          offset++
          machine.value[machine.offset] = b
          machine.offset += machine.increment
          break if machine.offset is machine.terminal
          return false if offset is length
      else
        loop
          b = buffer[offset]
          @bytesRead++
          offset++
          machine.value += Math.pow(256, machine.offset) * b
          machine.offset += machine.increment
          break if machine.offset == machine.terminal
          return true if offset == length
      @fields.push(machine.unpack())
      if  ++machine.index == machine.pattern.length
        @fields.push(this)
        for p in @user or []
          @fields.push(p)
        machine.callback.apply null, @fields
        @fields.length = 0
        @machine = null
      else
        machine.next()
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

    @machine      = new Machine pattern, callback
    @outgoing     = shiftable

    @machine.next(shiftable[0])

  write: (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    machine  = @machine
    while @machine and offset < length
      pattern = machine.pattern[machine.index]
      if pattern.unpacked
        loop
          buffer[offset] = machine.value[machine.offset]
          machine.offset += machine.increment
          @bytesWritten++
          offset++
          break if machine.offset is machine.terminal
          return true if offset is length
      else
        loop
          buffer[offset] = Math.floor(machine.value / Math.pow(256, machine.offset)) & 0xff
          machine.offset += machine.increment
          @bytesWritten++
          offset++
          break if machine.offset is machine.terminal
          return true if offset is length
      if ++machine.index is machine.pattern.length
        machine.callback.apply null, [ this ]
        @machine = null
      else
        machine.next(@outgoing[machine.index])
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

