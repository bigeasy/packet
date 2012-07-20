module.exports = require('proof')(function (equal, deepEqual) {
  var slice = Function.prototype.call.bind(Array.prototype.slice)
    , Serializer = require('../../lib/serializer').Serializer
    ;
  function toArray (buffer) {
    var array = [], i, I;
    for (i = 0, I = buffer.length; i < I; i++) {
      array[i] = buffer[i]
    }
    return array;
  }
  function serialize () {
    var splat = slice(arguments, 0)
      , message = splat.pop()
      , bytes = splat.pop()
      , written = splat.pop()
      , serializer = new Serializer
      ;
    serializer.buffer.apply(serializer, splat.concat(function (buffer) {
      equal(serializer.written, written, message + ' byte count');
      deepEqual(toArray(buffer), bytes, message + ' written');
    }));
  }
  return { Serializer: Serializer, serialize: serialize, toArray: toArray };
});
