module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var field2, i, I, value;

    field2 = object["foo"]
    if (end - start < field2.length) {
      return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    for (i = 0, I = field2.length; i < I; i++) {
      value = field2[i]
      buffer[start++] = (value >>> 8) & 0xff
      buffer[start++] = value & 0xff
    }

    if (end - start < 2) {
      return incremental.call(this, buffer, start, end, pattern, 1, object, callback);
    }

    value = object["bar"]
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