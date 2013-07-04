module.exports = require('proof')(function (equal, deepEqual, ok) {
  var slice = Function.prototype.call.bind(Array.prototype.slice)
    , createParser = require('../..').createParser
    , parser = createParser()
    ;
  function parseEqual (pattern, bytes, length) {
    var invoked = false, extracted = slice(arguments, 3), message = extracted.pop();
    parser.extract(pattern, function () {
      var fields = slice(arguments, 0);
      equal(parser.length, length, message + ' byte count');
      extracted.forEach(function (expect, i) {
        deepEqual(fields[i], expect, message + ' extracted ' + (i + 1));
      });
      invoked = true;
    });
    if (Array.isArray(length)) {
      var writes = length;
      var length = writes.reduce(function (offset, size) {
        return offset + size;
      }, 0);
      writes.reduce(function (offset, size) {
        parser.parse(bytes, offset, size);
        return offset + size;
      }, 0);
    } else {
      parser.parse(bytes);
    }
    ok(invoked, message + ' invoked');
  }
  return { createParser: createParser, parseEqual: parseEqual };
});
