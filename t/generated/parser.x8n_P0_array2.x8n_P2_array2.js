module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read;

    if (end - start < 4) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }




    start += 4

    return callback(object)
  }
}