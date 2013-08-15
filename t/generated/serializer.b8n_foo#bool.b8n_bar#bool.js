module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var field1, field2;

    if (end - start < 2) {
      return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    field1 = object["foo"]
    field1 = transforms.bool(false, null, field1)
    buffer[start] = field1
    field2 = object["bar"]
    field2 = transforms.bool(false, null, field2)
    buffer[start + 1] = field2

    start += 2


    this.write = terminator

    callback()

    if (this.write === terminator) {
        return start
    }

    return this.write(buffer, start, end)
  }
}