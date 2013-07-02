module.exports = require("proof")(function (deepEqual) {
  var parse = require("../../pattern").parse
    , parseEqual = function (pattern, expected, message) {
    // TODO: Remove after completing object first.
    function unname (field) {
      if (/^field\d$/.test(field.name)) {
        delete field.name;
      }
      delete field.named;
      if (field.packing) {
        field.packing = field.packing.map(unname);
      }
      if (field.alternation) {
        for (var key in field.alternation) {
          if (field.alternation[key].pattern)
          field.alternation[key].pattern = field.alternation[key].pattern.map(unname);
        }
      }
      return field;
    }
    var parsed = parse(pattern).map(unname);
    deepEqual(parsed, expected, message);
  }
  return { parseEqual: parseEqual };
});
