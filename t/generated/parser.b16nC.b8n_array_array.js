module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, first = start, count, i, array;

    count =
      buffer[start++] * 0x100 +
      buffer[start++];

    array = [];
    for (i = 0; i < count; i++) {
      array[i] = buffer[start++]
    }

    object["array"] = array;

    return callback(object)
  }
}