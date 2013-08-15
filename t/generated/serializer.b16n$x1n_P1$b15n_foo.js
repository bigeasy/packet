module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var value;

    if (end - start < 2) {
      return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = (0x1 << 15) +
      (object["foo"])
    value = value
    buffer[start] = (value >>> 8) & 0xff
    buffer[start + 1] = value & 0xff

    start += 2


    this.write = terminator

    callback()

    if (this.write === terminator) {
        return start
    }

    return this.write(buffer, start, end)
  }
}