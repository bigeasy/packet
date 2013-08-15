module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var i;

    for (i = 0; i < 2; i++) {
      buffer[start++] = 0x0

    }
    for (i = 0; i < 2; i++) {
      buffer[start++] = 0x2

    }

    this.write = terminator

    callback()

    if (this.write === terminator) {
        return start
    }

    return this.write(buffer, start, end)
  }
}