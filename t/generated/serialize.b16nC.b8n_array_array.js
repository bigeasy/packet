module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var field2, i, I, value;

    field2 = object["array"]
    value = field2.length
    buffer[start++] = (value >>> 8) & 0xff
    buffer[start++] = value & 0xff
    for (i = 0, I = field2.length; i < I; i++) {
      buffer[start++] = field2[i]
    }

    this.write = terminator

    callback()

    if (this.write === terminator) {
        return start
    }

    return this.write(buffer, start, end)
  }
}