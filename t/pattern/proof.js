module.exports = require("proof")(function (deepEqual) {
  var parse = require("../../pattern").parse
    , parseEqual = function (pattern, expected, message) {
    deepEqual(parse(pattern), expected, message);
  }
  return { parseEqual: parseEqual };
});
