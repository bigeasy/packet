module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var value;

    if (end - start < 6) {
      return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = object["foo"]
    buffer[start + 4] = (value >>> 8) & 0xff
    buffer[start + 5] = value & 0xff

    start += 6


    this.write = terminator

    callback()

    if (this.write === terminator) {
        return start
    }

    return this.write(buffer, start, end)
  }
}