{parse}       = require("./pattern")
{transforms}  = require("./transforms")
stream        = require "stream"

# Base class for `Serializer` and `Parser`.
class exports.Packet extends stream.Stream
  # Construct a packet that sends events using the given `self` as `this`.
  constructor: (@_self) ->
    @_packets = {}
    @_fields = []
    @_transforms = Object.create(transforms)
    @reset()

  # Create a copy that will adopt the packets defined in this object, through
  # prototype inheritence. This is used to efficently create parsers and
  # serializers that can run concurrently, from a pre-configured prototype,
  # following classic GoF prototype creational pattern.
  #
  # FIXME Test me.
  clone: ->
    copy            = new (@.constructor)()
    copy._packets   = Object.create(@_packets)
    copy

  # Map a named packet with the given `name` to the given `pattern`. 
  packet: (name, pattern, callback) ->
    callback      or= noop
    pattern         = parsePattern(pattern)
    @_packets[name] = {pattern, callback}

  # Resets the bytes read, bytes written and the current pattern. Used to
  # recover from exceptional conditions and generally a good idea to call this
  # method before starting a new series of packet parsing transitions.
  reset: ->
    @_bytesRead = 0
    @_bytesWritten = 0
    @_pattern = null
    @_callback = null
    @_fields = []

  # Excute the pipeline of transforms for the `pattern` on the `value`.
  pipeline: (pattern, value) ->
    # Run the piplines for parsing.
    if pattern.transforms
      for transform in pattern.transforms
        parameters = []
        for constant in transform.parameters
          parameters.push(constant)
        parameters.push(not @_outgoing)
        parameters.push(pattern)
        parameters.push(value)
        value = @_transforms[transform.name].apply null, parameters
    value

  # Setup the next field in the current pattern to read or write.
  _nextValue: (value) ->
    pattern     = @_pattern[@_patternIndex]
    little      = pattern.endianness == 'l'
    bytes       = pattern.bytes

    @_value     = value
    @_offset    = if little then 0 else bytes - 1
    @_increment = if little then 1 else -1
    @_terminal  = if little then bytes else -1
