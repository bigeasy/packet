module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, value, unsigned;

    if (end - start < 1) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = buffer[start]
    unsigned = (value & (0xff >> 2)) >> 3;
    object["foo"] = 0x4 & unsigned ? (0x7 - unsigned + 1) * -1 : unsigned;


    start += 1

    return callback(object)
  }
}