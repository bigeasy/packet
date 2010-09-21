# This module is separated for isolation during testing. It is meant to be
# exposed as part of the public API.

# Regular expression to match a JavaScript scalar taken in part from
# [json2.js](http://www.JSON.org/json2.js).
scalar = /('(?:[^\\']|\\.)+'|"(?:[^\\"]|\\.)+"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)(\s*,\s*|\s*\))?(.*)/

##### parse(pattern)
# Parse a pattern and create a list of fields.

# The `pattern` is the pattern to parse.
module.exports.parse = (pattern) ->

  fields  = []

  # We chip away at the pattern, removing the parts we.ve match, while keeping
  # track of the index separately for error messages.
  rest    = pattern
  index   = 0
  while rest.length

    # Match a packet pattern.
    match = /^(-?)([snbl])(\d+)([fha]?)(.*)$/.exec(rest)
    if !match
      throw  new Error "invalid pattern at #{index}"

    # Convert the match into an object.
    f =
      signed: !!match[1] || match[4] == "f"
      endianness: if match[2] == 'n' then 'b' else match[2]
      bits: parseInt(match[3], 10)
      type: match[4] || 'n'

    # The remainder of the pattern, if any.
    rest = match[5]

    # Move the character position up to the bit count.
    index++ if f.signed
    index++

    # Check for a valid character
    if f.bits == 0 or f.bits % 8
      throw new Error("bits must be divisible by 8 at " + index)
    if f.type == "f" and !(f.bits == 32 || f.bits == 64)
      throw Error("floats can only be 32 or 64 bits at " + index)

    # Move the character position up to the rest of the patternx.
    index += match[3].length
    index ++ if match[4]

    # Set the implicit fields.
    if (f.bits > 64 && f.type == "n")
      f.type = "a"
    f.bytes = f.bits / 8
    f.unpacked = f.signed || f.bytes > 8 || "ha".indexOf(f.type) != -1

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
    else
      f.arrayed = false
      f.repeat = 1

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
      f.terminator = tz[1] or "\0"
      f.arrayed = true
      rest = tz[2]
      if f.repeat is 1
        f.repeat = Number.MAX_VALUE

    # Parse piplines.
    while pipe = /^\|(\w[\w\d]*)\((\)?)(.*)/.exec(rest)
      transform       = { name: pipe[1], parameters: [] }
      rest            = pipe[3]
      hasArgument     = not pipe[2]

      while hasArgument
        arg         = scalar.exec(rest)
        value       = eval(arg[1])
        hasArgument = arg[2].indexOf(")") is -1
        rest        = arg[3]

        transform.parameters.push(value)

      (f.transforms or= []).push(transform)

    # Record the new field pattern object.
    fields.push(f)

  fields
