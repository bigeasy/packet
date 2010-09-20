parsePattern = require('./pattern').parse
ieee754 = require('./ieee754')

shiftify = (arrayish, start, end) ->
  a = []
  while start < end
    a.push arrayish[start++]
  return a

hex = (bytes) ->
  h = bytes.map (b) ->
    if b < 10
      "0" + b.toString(16)
    else
      b.toString(16)
  h.join("")

pack = (pattern, value) ->
  if pattern.type == "f"
    if pattern.bits == 32
      ieee754.toIEEE754Single value
    else
      ieee754.toIEEE754Double value
  else
    value

unpack = (bytes, pattern) ->
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
    return value

instance = (packets) ->
  machine = null
  user = shiftify arguments, 1, arguments.length

  mechanize = (definition, index, value) ->
    reading = arguments.length == 2
    pattern = definition.pattern[index]
    little = pattern.endianness == 'l'
    bytes = pattern.bytes
    if pattern.arrayed
      if reading
        value = []
      else
        value = pack pattern, value
    else if reading
      value = 0
    machine =
      value: value
      unpack: if pattern.arrayed then unpack else noop
      definition: definition
      index: index
      offset: if little then 0 else bytes - 1
      increment: if little then 1 else -1
      terminal: if little then bytes else -1
    return machine

  clone = ->
    args = shiftify arguments, 0, arguments.length
    args.unshift Object.create(packets)
    return instance.apply null, args

  noop = (value) -> value

  # Like packet, but no ability to define new named patterns.
  next = ->
    shiftable = shiftify arguments, 0, arguments.length
    nameOrPattern = shiftable.shift()
    if shiftable.length == 0
      machine = mechanize packets[nameOrPattern], 0
    else
      definition =
        pattern: packets[nameOrPattern] && packets[nameOrPattern].pattern || parsePattern(nameOrPattern)
        callback: shiftable.shift()
      machine = mechanize(definition, 0)
    packet.apply this, arguments

  packet = ->
    shiftable = shiftify arguments, 0, arguments.length
    nameOrPattern = shiftable.shift()
    if shiftable.length == 0
      machine = mechanize(packets[nameOrPattern], 0)
    else
      patternOrCallback = shiftable.shift()
      if typeof(patternOrCallback) == 'function'
        definition  =
          pattern: parsePattern(nameOrPattern)
          callback: patternOrCallback
        machine = mechanize definition, 0
      else
        packets[name] =
          pattern: parsePattern(pattern)
          callback: shiftable.shift() || noop

  outgoing = null
  send = () ->
    shiftable = shiftify arguments, 0, arguments.length
    nameOrPattern = shiftable.shift()
    if typeof shiftable[shiftable.length - 1] == 'function'
      definition =
        pattern: parsePattern(nameOrPattern)
        callback: shiftable.pop()
      machine = mechanize(definition , 0, shiftable[0])
    else
      machine = mechanize(packets[nameOrPattern], 0, shiftable[0])
    outgoing = shiftable

  write = (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    while machine and offset < length
      pattern = machine.definition.pattern[machine.index]
      if pattern.arrayed
        loop
          buffer[offset] = machine.value[machine.offset]
          machine.offset += machine.increment
          bytesWritten++
          offset++
          break if machine.offset is machine.terminal
          return true if offset is length
      else
        loop
          buffer[offset] = Math.floor(machine.value / Math.pow(256, machine.offset)) & 0xff
          machine.offset += machine.increment
          bytesWritten++
          offset++
          break if machine.offset is machine.terminal
          return true if offset is length
      if ++machine.index is machine.definition.pattern.length
        machine.definition.callback.apply null, [ engine ]
        machine = null
      else
        machine = mechanize machine.definition, machine.index, outgoing[machine.index]
    true

  fields = []
  bytesRead = 0
  bytesWritten = 0
  reset = () ->
    bytesRead = 0
    bytesWritten = 0
    machine = null

  engine =
    next: next
    getBytesRead: ->
      bytesRead
    getBytesWritten: -> bytesWritten

  read  = (buffer, offset, length) ->
    offset or= 0
    length or= buffer.length
    b
    while machine != null and offset < length
      if machine.definition.pattern[machine.index].arrayed
        loop
          b = buffer[offset]
          bytesRead++
          offset++
          machine.value[machine.offset] = b
          machine.offset += machine.increment
          break if machine.offset is machine.terminal
          return true if offset is length
      else
        loop
          b = buffer[offset]
          bytesRead++
          offset++
          machine.value += Math.pow(256, machine.offset) * b
          machine.offset += machine.increment
          break if machine.offset == machine.terminal
          return true if offset == length
      fields.push(machine.unpack(machine.value, machine.definition.pattern[machine.index]))
      if  ++machine.index == machine.definition.pattern.length
        fields.push(engine)
        for p in user
          fields.push(p)
        machine.definition.callback.apply null, fields
        machine = null
        fields.length = 0
      else
        machine = mechanize machine.definition, machine.index
    true

  { clone, packet, reset, send, write, read }

module.exports.create = () ->
  instance({})
