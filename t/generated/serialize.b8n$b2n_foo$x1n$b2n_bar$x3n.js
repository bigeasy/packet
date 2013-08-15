module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var value;

    if (end - start < 1) {
      return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = (object["foo"] << 6) +
      (object["bar"] << 3)
    buffer[start] = value

    start += 1


    this.write = terminator

    callback()

    if (this.write === terminator) {
        return start
    }

    return this.write(buffer, start, end)
  }
}