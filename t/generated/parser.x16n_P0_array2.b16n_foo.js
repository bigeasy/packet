module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read;

    if (end - start < 6) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }


    object["foo"] =
      buffer[start + 4] * 0x100 +
      buffer[start + 5];



    start += 6

    return callback(object)
  }
}