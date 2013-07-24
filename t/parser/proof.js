module.exports = require('proof')(function (equal, deepEqual, ok) {
  var slice = Function.prototype.call.bind(Array.prototype.slice)
    , createParser = require('../..').createParser
    ;
  function parseEqual () {
    var invoked = false, extracted = slice(arguments, 0), message = extracted.pop(), options = {};
    if (typeof extracted[0] == 'object') {
      options = extracted.shift();
    } else {
      options = {};
    }
    if (options.require) {
      options.precompiler = require('../require');
    }
    var parser = createParser(options || {});
    var pattern = extracted.shift(), bytes = extracted.shift(), length = extracted.shift();
    parser.packet('packet', pattern);
    parser.extract('packet', function () {
      var fields = slice(arguments, 0);
      equal(parser.length, length, message + ' byte count');
      extracted.forEach(function (expect, i) {
        deepEqual(fields[i], expect, message + ' extracted ' + (i + 1));
      });
      if (options.subsequent) {
        parser.extract('byte: b8', function () {});
      }
      invoked = true;
    });
    if (Array.isArray(length)) {
      var writes = length;
      var length = writes.reduce(function (offset, size) {
        return offset + size;
      }, 0);
      writes.reduce(function (offset, size) {
        parser.parse(bytes, offset, offset + size);
        return offset + size;
      }, 0);
    } else {
      parser.parse(bytes, 0, bytes.length);
    }
    if (options.subsequent) {
      parser.parse([ 0 ], 0, 1);
    }
    ok(invoked, message + ' invoked');
  }
  return { createParser: createParser, parseEqual: parseEqual };
});
