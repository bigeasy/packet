module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var field2, i, I, field4;

    field2 = object["foo"]
    if (end - start < field2.length) {
      return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    for (i = 0, I = field2.length; i < I; i++) {
      buffer[start++] = field2[i]
    }

    field4 = object["bar"]
    if (end - start < field4.length) {
      return incremental.call(this, buffer, start, end, pattern, 1, object, callback);
    }

    for (i = 0, I = field4.length; i < I; i++) {
      buffer[start++] = field4[i]
    }


    this.write = terminator

    callback()

    if (this.write === terminator) {
        return start
    }

    return this.write(buffer, start, end)
  }
}