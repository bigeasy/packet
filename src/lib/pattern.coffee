# This module is separated for isolation during testing. It is not meant to be
# exposed as part of the public API.

# Regular expression to match a pipeline argument, expressed as a JavaScript
# scalar, taken in part from [json2.js](http://www.JSON.org/json2.js). 
{argument, constant} = require "./argument"
next = /^(-?)([xbl])(\d+)([fa]?)(.*)$/

number = (pattern, part, index) ->
  if match = /^(&)?0x([0-9a-fA-F]+)(.*)$/i.exec part
    [ false, !! match[1], parseInt(match[2], 16), index + (match[1] or "").length + 2 + match[2].length, match[3] ]
  else if match = /^(\d+)(.*)$/.exec part
    [ false, false, parseInt(match[1], 10), index + match[1].length, match[2] ]
  else if match = /^\*(.*)$/.exec part
    [ true, false, 0, index + 1, match[1] ]
  else
    throw new Error error "invalid number", pattern, index

# Parse an alternation condition.
condition = (pattern, struct, text, index) ->
  startIndex = index
  [ any, mask, value, index, range ] = number pattern, text, index
  if mask
    if  range[0] is "-"
      throw new Error error "masks not permitted in ranges", pattern, startIndex
    struct.mask = value
  else if not any
    if  range[0] is "-"
      if mask
        throw new Error error "masks not permitted in ranges", pattern, startIndex
      index++
      [ any, mask, maximum, nextIndex, range ] = number pattern, range.substring(1), index
      if mask
        throw new Error error "masks not permitted in ranges", pattern, index
      if any
        throw new Error error "any not permitted in ranges", pattern, index
      index = nextIndex
      struct.minimum = value
      struct.maximum = maximum
    else
      struct.minimum = struct.maximum = value
  if match = /(\s*)\S/.exec range
    index += match[1].length
    throw new Error error "invalid pattern", pattern, index
  index

FAILURE =
  minimum: Number.MIN_VALUE
  maximum: Number.MAX_VALUE
  mask: 0

always = ->
  {
    maximum: Number.MAX_VALUE
    minimum: Number.MIN_VALUE
    mask: 0
  }

never = ->
  {
    maximum: Number.MIN_VALUE
    minimum: Number.MAX_VALUE
  }

alternates = (pattern, array, rest, primary, secondary, allowSecondary, index) ->
  while rest
    alternate             = {}
    alternate[primary]    = always()
    alternate[secondary]  = if allowSecondary then always() else never()

    match = /^([^/:]+)(?:(\s*\/\s*)([^:]+))?(:\s*)(.*)$/.exec rest
    if match
      [ first, delimiter, second, imparative, rest ] = match.slice(1)
      startIndex = index
      condition pattern, alternate[primary], first, index
      if allowSecondary
        if second
          condition pattern, alternate[secondary], second, index
        else
          alternate[secondary] = alternate[primary]
      else if second
        slashIndex = startIndex + first.length + delimiter.indexOf("/")
        throw new Error error "field alternates not allowed", pattern, slashIndex
      index += first.length + imparative.length
      index += delimiter.length + second.length if delimiter?

    if match = /^(\s*)([^|]+)(\|\s*)(.*)$/.exec rest
      [ padding, part, delimiter, rest ] = match.slice(1)
    else
      [ padding, part, delimiter, rest ] = [ "", rest, "", null ]
    index += padding.length
    alternate.pattern = parse next, pattern, part, index, 8
    index += part.length + delimiter.length

    array.push alternate

##### parse(pattern)
# Parse a pattern and create a list of fields.

# The `pattern` is the pattern to parse.
module.exports.parse = (pattern) ->
  part = pattern.replace(/\n/g, " ").replace(/^\s+/, " ")
  index = pattern.length - part.length
  parse next, pattern, part, index, 8

# We don't count an initial newline as a line.
error = (message, pattern, index) ->
  if pattern.indexOf("\n") != -1
    lines = pattern.substring(0, index).split /\n/
    lines.shift() if lines[0] is ""
    "#{message} at line #{lines.length} character #{lines.pop().length + 1}"
  else
    "#{message} at character #{index + 1}"


parse = (next, pattern, part, index, bits) ->
  fields          = []
  lengthEncoded   = false

  # We chip away at the pattern, removing the parts we've matched, while keeping
  # track of the index separately for error messages.
  rest            = part
  loop
    # Match a packet pattern.
    match = next.exec(rest)

    # The 6th field is a trick to reuse this method for bit packing patterns
    # which are limited in what they can do. For bit packing the 5th pattern
    # will match the rest only if it begins with a comma or named field arrow,
    # otherwise it falls to the 6th which matches.
    if !match
      throw  new Error error "invalid pattern", pattern, index
    if match[6]
      throw  new Error error "invalid pattern", pattern, index + rest.length - match[6].length

    # The remainder of the pattern, if any.
    rest = match[5]

    # Convert the match into an object.
    f =
      signed:     !!match[1] || match[4] == "f"
      endianness: if match[2] == 'n' then 'b' else match[2]
      bits:       parseInt(match[3], 10)
      type:       match[4] || 'n'

    # Move the character position up to the bit count.
    index++ if match[1]
    index++

    # Check for a valid character
    if f.bits == 0
      throw new Error error "bit size must be non-zero", pattern, index
    if f.bits % bits
      throw new Error error "bit size must be divisible by #{bits}", pattern, index
    if f.type == "f" and !(f.bits == 32 || f.bits == 64)
      throw Error error "floats can only be 32 or 64 bits", pattern, index

    # Move the character position up to the rest of the pattern.
    index += match[3].length
    index++ if match[4]

    # Set the implicit fields. Unpacking logic is inconsistant between bits and
    # bytes, but not applicable for bits anyway.
    f.type      = "a" if f.bits > 64 and f.type == "n"
    f.bytes     = f.bits / bits
    f.unpacked  = f.signed or f.bytes > 8 or "ha".indexOf(f.type) != -1


    # Check for bit backing. The intense rest pattern allows us to skip over a
    # nested padding specifier in the bit packing pattern, nested curly brace
    # matching for a depth of one.
    pack = /^{((?:-b|b|x).+)}(\s*,.*|\s*)$/.exec(rest)
    if pack
      index++

      packIndex = index

      f.packing   = parse /^(-?)([xb])(\d+)()(\s*(?:,|=>|{\d).*|)(.*)$/, pattern, pack[1], index, 1
      rest        = pack[2]
      index      += pack[1].length + 1

      sum = 0
      for pack in f.packing
        sum += pack.bits

      if sum < f.bits
        throw new Error error "bit pack pattern underflow", pattern, packIndex

      if sum > f.bits
        throw new Error error "bit pack pattern overflow", pattern, packIndex

    # Check for alternation.
    else if alternation = /^\(([^)]+)\)(.*)$/.exec(rest)
      f.arrayed     = true
      read          = alternation[1]
      rest          = alternation[2]
      write         = null
      if alternation = /^(\s*\/\s*)\(([^)]+)\)(.*)$/.exec(rest)
        slash         = alternation[1]
        write         = alternation[2]
        rest          = alternation[3]
      index += 1
      alternates pattern, f.alternation = [], read, "read", "write", not write, index
      index += read.length + 1
      if write
        index += slash.length + 1
        alternates pattern, f.alternation, write, "write", "read", false, index
        index += write.length
      f.alternation.push {
        read: FAILURE, write: FAILURE, failed: true
      }
    else
      # Check if this is a length encoding.
      length = /^\/(.*)$/.exec(rest)
      if length
        f.lengthEncoding = true
        rest = length[1]
        f.arrayed = false
        f.repeat = 1
        lengthEncoded = true
        fields.push(f)
        # Nothing else can apply to a length encoding.
        continue

      f.repeat    = 1
      f.arrayed   = lengthEncoded
      if not lengthEncoded
        # Check for structure modifiers.
        arrayed = /^\[(\d+)\](.*)$/.exec(rest)
        if arrayed
          f.arrayed = true
          f.repeat = parseInt(arrayed[1], 10)
          index++
          if f.repeat == 0
            throw new Error("array length must be non-zero at " + index)
          index += arrayed[1].length + 1
          rest = arrayed[2]

      # Check for a padding value.
      padding = /^{(0x|0)?(\d+)}(.*)$/.exec(rest)
      if padding
        base      = padding[1]
        pad       = padding[2]
        rest      = padding[3]

        if base
          if base == "0x"
            f.padding = parseInt(pad, 16)
          else
            f.padding = parseInt(pad, 8)
        else
          f.padding = parseInt(pad, 10)

      # Check for zero termination.
      tz = /^z(?:<(.*?)>)?(.*)$/.exec(rest)
      if tz
        index++
        if tz[1]?
          index++
          f.terminator = []
          terminator = tz[1]
          loop
            if not match = /^(\s*)(?:0x([A-F-a-f00-9]{2})|(\d+))(\s*,)?(.*)$/.exec terminator
              throw new Error error "invalid terminator", pattern, index
            [ before, hex, decimal, comma, rest ] = match.slice(1)
            index += before.length
            numberIndex = index
            if hex
              value = parseInt hex, 16
              index += hex.length + 2
            else
              value = parseInt decimal, 10
              index += decimal.length
            if value > 255
              throw new Error error "terminator value out of range", pattern, numberIndex
            f.terminator.push value
            if /\S/.test(rest) and not comma
              throw new Error error "invalid pattern", pattern, index
            if not comma
              break
            terminator = rest
            index += comma.length
          index++
        else
          f.terminator = [ 0 ]
        f.arrayed = true
        rest = tz[2]
        if f.repeat is 1
          f.repeat = Number.MAX_VALUE

      # Parse piplines.
      while pipe = /^\|(\w[\w\d]*)\((\)?)(.*)/.exec(rest)
        index          += rest.length - pipe[3].length
        transform       = { name: pipe[1], parameters: [] }
        rest            = pipe[3]
        hasArgument     = not pipe[2]

        while hasArgument
          arg         = argument.exec(rest)
          index      += rest.length - arg[3].length
          value       = eval(arg[1])
          hasArgument = arg[2].indexOf(")") is -1
          rest        = arg[3]

          transform.parameters.push(value)

        (f.pipeline or= []).push(transform)

      # Named pattern.
      name = /^\s*=>\s*(\w[\w\d]+)\s*(.*)/.exec(rest)
      if name
        index += rest.length - name[2].length
        f.name = name[1]
        rest = name[2]

    # Record the new field pattern object.
    fields.push(f)

    # A comma indicates that we're to continue.
    more = /^(\s*,\s*)(.*)$/.exec(rest)
    break if not more

    # Reset for the next iteration.
    index += more[1].length
    rest = more[2]
    lengthEncoded = false

  if /\S/.test(rest)
    throw  new Error error "invalid pattern", pattern, index

  fields
