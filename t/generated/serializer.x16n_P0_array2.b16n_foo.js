module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var i, value;

    if (end - start < 2) {
      return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    for (i = 0; i < 2; i++) {
      buffer[start++] = 0x0
      buffer[start++] = 0x0

    }
    value = object["foo"]
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