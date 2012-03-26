module.exports = require("proof") ->
  {parse} = require "../../lib/pattern"
  parseEqual = (pattern, expected, message) =>
    @deepEqual parse(pattern), expected, message
  { parseEqual }
