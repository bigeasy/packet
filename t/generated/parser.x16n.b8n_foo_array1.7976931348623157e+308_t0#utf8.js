module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, array, first = start, second, value;

    if (end - start < 2) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }


    second = start
    array = [];
    for (;;) {
      if (start == end) {
          return incremental.call(this, buffer, second, end, pattern, 0, object, callback);
      }

      value = buffer[start + 2]
      start += 1;
      if (value == 0) break;
      array.push(value);
    }
    array = transforms.utf8(true, null, array);
    object["foo"] = array;

    return callback(object)
  }
}