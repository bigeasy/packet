module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, value;

    if (end - start < 2) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = buffer[start]
    value = transforms.bool(true, null, value);
    object["foo"] = value;

    value = buffer[start + 1]
    value = transforms.bool(true, null, value);
    object["bar"] = value;


    start += 2

    return callback(object)
  }
}