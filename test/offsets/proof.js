module.exports = require('proof')(function (equal, deepEqual, ok) {
  var slice = Function.prototype.call.bind(Array.prototype.slice)
    , createParser = require('../..').createParser
    , parser = createParser()
    ;
  function offsetsOf (pattern, bytes, expected, label) {
    // TODO: Get rid of invoked.
    var invoked = false;
    parser.packet('pattern', pattern);
    parser.extract('pattern', function () {
      var serializer = parser.createSerializer();
      serializer.serialize.apply(serializer, ['pattern'].concat(slice(arguments, 0)));
      var fields = serializer.offsetsOf(bytes);
      console.log(fields[0])
      deepEqual(fields, expected, label + ' expected');
      deepEqual(bytes.length, serializer.sizeOf, label + ' size of');
      invoked = true;
    });
    parser.parse(bytes, 0, bytes.length);
    ok(invoked, label + ' invoked');
  }
  return { createParser: createParser, offsetsOf: offsetsOf };
});
