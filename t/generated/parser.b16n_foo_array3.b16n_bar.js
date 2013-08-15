module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, array;

    if (end - start < 8) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    array = new Array(3);
    array[0] =
      buffer[start] * 0x100 +
      buffer[start + 1];

    array[1] =
      buffer[start + 2] * 0x100 +
      buffer[start + 3];

    array[2] =
      buffer[start + 4] * 0x100 +
      buffer[start + 5];

    object["foo"] = array;

    object["bar"] =
      buffer[start + 6] * 0x100 +
      buffer[start + 7];



    start += 8

    return callback(object)
  }
}