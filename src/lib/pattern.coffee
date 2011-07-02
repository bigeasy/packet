# This module is separated for isolation during testing. It is not meant to be
# exposed as part of the public API.

# Regular expression to match a pipeline argument, expressed as a JavaScript
# scalar, taken in part from [json2.js](http://www.JSON.org/json2.js). 
{argument, constant} = require "./argument"
next = /^(-?)([xbl])(\d+)([fha]?)(.*)$/

##### packing(pattern)
# Parse bit packing.

# The `pattern` is the bit packing pattern to parse.
packing = (pattern, size, index) ->

  fields  = []
  rest    = pattern

  loop
    # Match an element pattern.
    match = /^(-?)([xb])(\d+)(.*)$/.exec rest
    if not match
      throw new Error "invalid pattern at index #{index}"

    # Convert the match into an object.
    f =
      signed:     !!match[1]
      endianness: match[2]
      bits:       parseInt(match[3], 10)
      type:       'n'
    rest = match[4]

    fields.push f

    size -= f.bits
    if size < 0
      throw new Error "bit field overflow at #{index}"

    # Move the character position up to the bit count.
    index++ if match[1]
    index++
    index += match[3].length

    # Check for a valid bit size.
    if f.bits == 0
      throw new Error("bit size must be non-zero at #{index}")


    # A comma indicates that we're to continue.
    more = /^\s*,\s*(.*)$/.exec(rest)
    break if not more

    # Reset for the next iteration.
    rest = more[1]

  if size != 0
    throw new Error "bit field underflow at #{index}"

  fields

pass = -> true

number = (pattern, index) ->
  if match = /^(\d+)(.*)$/.exec pattern
    [ false, parseInt(match[1], 10), index + match[1].length, match[2] ]
  else if match = /^(&)0x([0-9a-f]+)(.*)$/i.exec pattern
    [ !! match[1], parseInt(match[2], 16), index + match[1].length + match[2].length, match[2] ]
  else
    throw new Error "invalid pattern at index #{index}"

between = (mininum, maximum) ->
  (value) -> minimm <= value && value <= maximum

equal = (target) ->
  (value) -> value is target

mask = (mask) ->
  (value) -> (value & mask) is mask

branch = (pattern, index) ->
  rest = pattern
  branches = []
  defaulted = false
  while rest
    fork = { minimum: Number.MIN_VALUE, maximum: Number.MAX_VALUE, mask: 0 }
    match = /^([^:]+):\s*(.*)$/.exec rest
    if match
      [ condition, rest ] = match.slice(1)
      [ mask, value, index, range ] = number condition, index
      if not mask
        if  range[0] is "-"
          index++
          [ mask, maximum, nextIndex, range ] = number range.substring(1), index
          if mask
            throw new Error "masks not permitted in ranges at index #{index}"
          index = nextIndex
          if match = /(\s*)\S/.test range
            throw new Error "invalid pattern at index #{index + match[1].length}"
          fork.minimum = value
          fork.maximum = maximum
        else
          fork.minimum = fork.maximum = value
      else
        fork.mask = value
    else
      defaulted = true
    if match = /^\s*([^|]+)\|\s*(.*)$/.exec rest
      [ alternate, rest ] = match.slice(1)
    else
      [ alternate, rest ]  = [ rest, "" ]
    fork.pattern = parse({ pattern: alternate, index, next: next })
    index += alternate.length
    index += 1 if match
    branches.push fork
  if not defaulted
    branches.push {
      minimum: Number.MIN_VALUE
      maximum: Number.MAX_VALUE
      mask: 0
      failed: true
    }
  branches

##### parse(pattern)
# Parse a pattern and create a list of fields.

# The `pattern` is the pattern to parse.
module.exports.parse = (pattern) -> parse({ pattern, index: 0, next })

parse = (o) ->
  fields          = []
  lengthEncoded   = false

  # We chip away at the pattern, removing the parts we've matched, while keeping
  # track of the index separately for error messages.
  rest            = o.pattern
  index           = o.index
  loop
    # Match a packet pattern.
    match = o.next.exec(rest)
    if !match
      throw  new Error "invalid pattern at index #{index}"

    # The remainder of the pattern, if any.
    rest = match.pop()

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
      throw new Error("bit size must be non-zero at index #{index}")
    if f.bits % 8
      throw new Error("bit size must be divisible by 8 at index #{index}")
    if f.type == "f" and !(f.bits == 32 || f.bits == 64)
      throw Error("floats can only be 32 or 64 bits at index #{index}")

    # Move the character position up to the rest of the pattern.
    index += match[3].length
    index++ if match[4]

    # Set the implicit fields.
    f.type      = "a" if f.bits > 64 and f.type == "n"
    f.bytes     = f.bits / 8
    f.unpacked  = f.signed or f.bytes > 8 or "ha".indexOf(f.type) != -1


    # Check for bit backing.
    pack = /^{((?:-b|b|x)[^}]+)}(.*)$/.exec(rest)
    if pack
      f.packing   = packing pack[1], f.bits, index
      rest        = pack[2]
      index      += pack[1].length
    # Check for alternation.
    else if alternation = /^\(([^)]+)\)(.*)$/.exec(rest)
      f.arrayed     = true
      f.alternation = branch alternation[1], index
      rest          = alternation[2]
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
        index += rest.length - tz[2].length
        f.terminator = tz[1] or "\0"
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

        (f.transforms or= []).push(transform)

      # Named pattern.
      name = /\s*=>\s*(\w[\w\d]+)\s*(.*)/.exec(rest)
      if name
        index += rest.length - name[2].length
        f.name = name[1]
        rest = name[2]

    # Record the new field pattern object.
    fields.push(f)

    # A comma indicates that we're to continue.
    more = /^\s*,\s*(.*)$/.exec(rest)
    break if not more

    # Reset for the next iteration.
    rest = more[1]
    lengthEncoded = false

  if /\S/.test(rest)
    throw  new Error "invalid pattern at index #{index}"

  fields
