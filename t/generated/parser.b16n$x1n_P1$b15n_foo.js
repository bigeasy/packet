module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, value;

    if (end - start < 2) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value =
      buffer[start] * 0x100 +
      buffer[start + 1];

    object["foo"] = (value & (0xffff >> 1)) >> 0;


    start += 2

    return callback(object)
  }
}