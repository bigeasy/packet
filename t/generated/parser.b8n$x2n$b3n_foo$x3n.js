module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, value;

    if (end - start < 1) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = buffer[start]
    object["foo"] = (value & (0xff >> 2)) >> 3;


    start += 1

    return callback(object)
  }
}