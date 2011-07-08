{Parser}      = require "./parser"
{Serializer}  = require "./serializer"

module.exports.Structure = class Structure
  constructor: (pattern) ->
    @parser = new Parser()
    @parser.packet("structure", pattern)

    @serializer = new Serializer()
    @serializer.packet("structure", pattern)

  sizeOf: (values...) -> 0

  read: (buffer, offset, callback) ->
    callback = offset if typeof offset is "function" and not callback
    @parser.reset()
    @parser.parse("structure", callback)
    @parser.read(buffer, offset, Number.MAX_VALUE)

  write: (values...) ->
    buffer = values.shift()
