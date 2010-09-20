# This module is separated for isolation during testing. It is meant to be
# exposed as part of the public API.

# Parse the `pattern` and add it to the list of `fields`.
# 
# The `pattern` points to the first character of field in the packet pattern.
# Each recursive call to `field` will pass the remaining unmached part. The
# `index` is the current position in the string used to report errors, but not
# to index into the string.
field = (fields, pattern, index) ->

  # Match a packet pattern.
  match = /^(-?)([snbl])(\d+)([fha]?)(.*)$/.exec(pattern)
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
  index +=  f.endianness.length

  # Check for a valid character
  if f.bits == 0 or f.bits % 8
    throw new Error("bits must be divisible by 8 at " + index)
  if f.type == "f" and !(f.bits == 32 || f.bits == 64)
    throw Error("floats can only be 32 or 64 bits at " + index)

  # Move the character position up to the rest of the patternx.
  index += f.bits.length

  # Set the implicit fields.
  if (f.bits > 64 && f.type == "n")
    f.type = "a"
  f.bytes = f.bits / 8
  f.arrayed = f.signed || f.bytes > 8 || "ha".indexOf(f.type) != -1

  # Record the new field pattern object.
  fields.push(f)

  # If we have more characters to parse, recurse.
  if rest.length != 0
    field fields, rest, index
  else
    fields

# Export the pattern method.
module.exports.parse = (pattern) ->
  return field [], pattern, 0
