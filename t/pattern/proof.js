module.exports = require("proof")(function (deepEqual) {
  var parse = require("../../lib/pattern").parse
    , parseEqual = function (pattern, expected, message) {
    deepEqual(parse(pattern), expected, message);
  }
  return { parseEqual: parseEqual };
});
