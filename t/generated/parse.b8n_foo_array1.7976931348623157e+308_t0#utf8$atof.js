module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, first = start, second, array, value;

    second = start
    array = [];
    for (;;) {
      if (start == end) {
          return incremental.call(this, buffer, second, end, pattern, 0, object, callback);
      }

      value = buffer[start]
      start += 1;
      if (value == 0) break;
      array.push(value);
    }
    array = transforms.utf8(true, null, array);
    array = transforms.atof(true, null, array);
    object["foo"] = array;

    return callback(object)
  }
}