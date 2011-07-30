# The defualt transforms built into Packet.
transforms = exports.transforms =
  # Convert the value to and from the given encoding.
  str: (encoding, parsing, field, value) ->
    if parsing
      if not (value instanceof Buffer)
        value = new Buffer(value)
      if /^ascii$/i.test(encoding)
        # Broken and waiting on [297](http://github.com/ry/node/issues/issue/297).
        # If the top bit is set, it is not ASCII, so we zero the value.
        for i in [0...value.length]
          value[i] = 0 if value[i] & 0x80
        encoding = "utf8"
      length = value.length
      value.toString(encoding, 0, length)
    else
      buffer = new Buffer(value, encoding)
      if encoding is "ascii"
        for i in [0...buffer.length]
          buffer[i] = 0 if value.charAt(i) is '\0'
      buffer

  # Convert to and from ASCII.
  ascii: (parsing, field, value) ->
    transforms.str("ascii", parsing, field, value)

  # Convert to and from UTF-8.
  utf8: (parsing, field, value) ->
    transforms.str("utf8", parsing, field, value)

  # Add padding to a value before you write it to stream.
  pad: (character, length, parsing, field, value) ->
    if not parsing
      while value.length < length
        value = character + value
    value

  # Convert a text value from alphanumeric to integer.
  atoi: (base, parsing, field, value) ->
    if parsing then parseInt(value, base) else value.toString(base)

  # Convert a text value from alphanumeric to float.
  atof: (parsing, field, value) ->
    if parsing then parseFloat(value) else value.toString()
