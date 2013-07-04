module.exports = require('proof')(function (equal, deepEqual) {
  var slice = Function.prototype.call.bind(Array.prototype.slice)
    , createSerializer = require('../..').createSerializer
    ;
  function toArray (buffer) {
    var array = [], i, I;
    for (i = 0, I = buffer.length; i < I; i++) {
      array[i] = buffer[i]
    }
    return array;
  }
  function serialize () {
    var vargs = slice(arguments, 0)
      , message = vargs.pop()
      , bytes = vargs.pop()
      , written = vargs.pop()
      , serializer = createSerializer()
      , buffer = Array.isArray(vargs[0]) ? vargs.shift() : new Buffer(1024)
      , sum
      ;
    serializer.serialize.apply(serializer, vargs);
    var sizeOf = serializer.sizeOf;
    if (Array.isArray(written)) {
      written = written.reduce(function (previous, current) {
        serializer.write(buffer, previous, previous + current); 
        return previous + current;
      }, 0);
    } else {
      serializer.write(buffer);
    }
    equal(sizeOf, written, message + ' sizeOf');
    equal(serializer.length, written, message + ' byte count');
    deepEqual(toArray(buffer.slice(0, serializer.length)), bytes, message + ' written');
  }
  return { createSerializer: createSerializer, serialize: serialize, toArray: toArray };
});
