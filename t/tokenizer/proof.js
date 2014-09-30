require('proof')(module, function (body, assert) {
  var parse = require('../../tokenizer').parse
    var parseEqual = function (pattern, expected, message) {
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
    assert(parsed, expected, message);
  }
  body(parseEqual);
});
