module.exports = require('proof')(function (equal, deepEqual, ok) {
  var slice = Function.prototype.call.bind(Array.prototype.slice)
    , Parser = require('../..').Parser
    , parser = new Parser;
  function parseEqual (pattern, bytes, length) {
    var invoked = false, extracted = slice(arguments, 3), message = extracted.pop();
    parser.reset();
    parser.extract(pattern, function () {
      var fields = slice(arguments, 0);
      equal(parser.length, length, message + ' byte count');
      extracted.forEach(function (expect, i) {
        deepEqual(fields[i], expect, message + ' extracted ' + (i + 1));
      });
      invoked = true;
    });
    parser.parse(bytes);
    ok(invoked, message + ' invoked');
  }
  return { Parser: Parser, parseEqual: parseEqual };
});
