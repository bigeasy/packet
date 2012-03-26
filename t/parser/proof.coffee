module.exports = require("proof") ->
  {Parser}    = require "../../lib/parser"
  parser = new Parser
  parseEqual = (pattern, bytes, read, extracted..., message) =>
    parser.reset()
    invoked = false
    parser.extract pattern, (fields...) =>
      @equal parser.getBytesRead(), read, "#{message} byte count"
      for expect, i in extracted
        @deepEqual fields[i], expect, "#{message} extracted #{i + 1}"
      invoked = true
    parser.parse bytes
    @ok invoked, "#{message} invoked"
  { Parser, parseEqual }
