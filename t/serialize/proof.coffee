module.exports = require("proof") ->
  {Serializer}    = require "../../lib/serializer"
  toArray = (buffer) ->
    array = []
    for i in [0...buffer.length]
      array[i] = buffer[i]
    array
  serialize = (splat..., written, bytes, message) =>
    serializer = new Serializer
    serializer.buffer.apply serializer, splat.concat (buffer) =>
      # TODO No. Just be a property.
      @equal serializer.getBytesWritten(), written, "#{message} byte count"
      @deepEqual toArray(buffer), bytes, "#{message} written"
  { Serializer, serialize, toArray }
