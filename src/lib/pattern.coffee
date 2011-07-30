# Don't forget that parsers of any sort tend to be complex. A simple PEG grammar
# quickly becomes a thousand lines. This compiles to under 400 lines of
# JavaScript. You are giong to find it difficult to make it much smaller.
#
# This module is separated for isolation during testing. It is not meant to be
# exposed as part of the public API.

# We don't count an initial newline as a line.
error = (message, pattern, index) ->
  if pattern.indexOf("\n") != -1
    lines = pattern.substring(0, index).split /\n/
    lines.shift() if lines[0] is ""
    "#{message} at line #{lines.length} character #{lines.pop().length + 1}"
  else
    "#{message} at character #{index + 1}"

BASE = { "0x": 16, "0": 8, "X": 10 }

numeric = (base, value) ->
  try
    parseInt(value, BASE[base or "X"])
  catch e
    null

# Extract an alternation range number or bit mask from at the current pattern
# substring given by `rest`.
number = (pattern, rest, index) ->
  match = ///
    ^               # start
    (                 # capture for length
      (?:
        \*                # any
        |
        (?:
          (\&?)              # test is mask
          0x([0-9a-f]+)     # hex
          |
          (\d+)             # decimal
        )
      )
    (-)?            # range
    ) 
    (.*)            # rest
    $               # end
  ///i.exec rest

  if not match
    throw new Error error "invalid number", pattern, index

  [ matched, mask, hex, decimal, range, rest ] = match.slice 1

  if hex?
    value = parseInt hex, 16
  else if decimal?
    value = parseInt decimal, 10

  index += matched.length

  { any: ! value?, mask: !! mask, value, index, range, rest }

# Parse an alternation condition.
condition = (pattern, index, rest, struct) ->
  from = number pattern, rest, index
  if from.mask
    if from.range
      throw new Error error "masks not permitted in ranges", pattern, index
    struct.mask = from.value
  else if not from.any
    if from.range
      if from.mask
        throw new Error error "masks not permitted in ranges", pattern, from.index - 1
      to = number pattern, from.rest, from.index
      if to.mask
        throw new Error error "masks not permitted in ranges", pattern, from.index
      if to.any
        throw new Error error "any not permitted in ranges", pattern, from.index
      struct.minimum = from.value
      struct.maximum = to.value
    else
      struct.minimum = struct.maximum = from.value
  else if from.range
    throw new Error error "any not permitted in ranges", pattern, index
  num = to or from
  if match = /(\s*)\S/.exec num.rest
    throw new Error error "invalid pattern", pattern, index + match[1].length
  index

# An alternation condition that never matches. This is not a constant for the
# sake of consistancy with `always()`.
never = ->
  {
    maximum: Number.MIN_VALUE
    minimum: Number.MAX_VALUE
  }

# Generates an alternation condition that will always match. This is not a
# constant because we build upon it to create specific conditions.
always = ->
  {
    maximum: Number.MAX_VALUE
    minimum: Number.MIN_VALUE
    mask: 0
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
      condition pattern, index, first, alternate[primary]
      if allowSecondary
        if second
          condition pattern, index, second, alternate[secondary]
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
    alternate.pattern = parse pattern, part, index, 8
    index += part.length + delimiter.length

    array.push alternate

# Parse a part of a pattern. The `next` regular expression is replaced when we
# match bit packing patterns, with a regular expression that excludes modifiers
# that are non-applicable to bit packing patterns.
parse = (pattern, part, index, bits, next) ->
  fields          = []
  lengthEncoded   = false
  next          or= /^(-?)([xbl])(\d+)([fa]?)(.*)$/

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
    f.exploded  = f.signed or f.bytes > 8 or "ha".indexOf(f.type) != -1


    # Check for bit backing. The intense rest pattern in the regex allows us to
    # skip over a nested padding specifier in the bit packing pattern, nested
    # curly brace matching for a depth of one.
    pack = /^{((?:-b|b|x).+)}(\s*,.*|\s*)$/.exec(rest)
    if pack
      index++

      packIndex = index

      f.packing   = parse pattern, pack[1], index, 1, ///
        ^       # start
        (-?)    # sign
        ([xb])  # skip or big-endian
        (\d+)   # bits
        ()      # never a modifier
        (       # valid tokens following size
          \s*     # optional whitespace followed by
          (?:
            ,     # a comma to continue the pattern
            |
            =>    # a name specifier
            |
            {\d   # a fill character specifier
          )
          .*    # the rest of the pattern
          |
        )
        (.*)    # match everything if the previous match misses
        $
      ///
      rest        = pack[2]
      index      += pack[1].length + 1

      # Check that the packed bits sum up to the size of the field into which
      # they are packed.
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

      # See if there is a full write pattern. If not, then the pattern will be
      # the same for reads and writes, but with possible different conditions
      # for write to match an alternate.
      if alternation = /^(\s*\/\s*)\(([^)]+)\)(.*)$/.exec(rest)
        slash         = alternation[1]
        write         = alternation[2]
        rest          = alternation[3]

      # Parse the primary alternation pattern.
      index += 1
      alternates pattern, f.alternation = [], read, "read", "write", not write, index
      index += read.length + 1

      # Parse the full write alternation pattern, if we have one.
      if write
        index += slash.length + 1
        alternates pattern, f.alternation, write, "write", "read", false, index
        index += write.length

      # This condition will catch all, and let us know that no condition
      # matched.
      f.alternation.push {
        read: always(), write: always(), failed: true
      }

    # Neither bit packing nor alternation.
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
      padding = /^({\s*)((0x|0)?([a-f\d]+)\s*})(.*)$/i.exec(rest)
      if padding
        [ before, after, base, pad, rest ] = padding.slice 1
        index += before.length
        unless (f.padding = numeric(base, pad))?
          throw new Error error, "invalid number format", pattern, index
        index += after.length

      # Check for zero termination.
      tz = /^z(?:<(.*?)>)?(.*)$/.exec(rest)
      if tz
        index++
        if tz[1]?
          index++
          f.terminator = []
          terminator = tz[1]
          loop
            if not match = ///
              ^         # start
              (\s*)     # skip whitespace
              (?:
                0x([A-F-a-f00-9]{2})  # hex
                |
                (\d+)                 # decimal
              )
              (\s*,)?   # separtor for next character
              (.*)      # rest
              $         # end
            ///.exec terminator
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
              index += rest.length
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

        # Regular expression to match a pipeline argument, expressed as a
        # JavaScript scalar, taken in part from
        # [json2.js](http://www.JSON.org/json2.js). 
        while hasArgument
          arg         = ///
            ( '(?:[^\\']|\\.)+'|"(?:[^\\"]|\\.)+"   # string
            | true | false                          # boolean
            | null                                  # null
            | -?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?     # number
            )    
            (\s*,\s*|\s*\))?                        # remaining arguments
            (.*)                                    # remaining pattern
          ///.exec rest
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

##### parse(pattern)
# Parse a pattern and create a list of fields.

# The `pattern` is the pattern to parse.
module.exports.parse = (pattern) ->
  part = pattern.replace(/\n/g, " ").replace(/^\s+/, " ")
  index = pattern.length - part.length
  parse pattern, part, index, 8

