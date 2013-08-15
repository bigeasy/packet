module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, array;

    if (end - start < 8) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    array = new Array(4);
    array[0] = buffer[start]
    array[1] = buffer[start + 1]
    array[2] = buffer[start + 2]
    array[3] = buffer[start + 3]
    object["foo"] = array;

    array = new Array(4);
    array[0] = buffer[start + 4]
    array[1] = buffer[start + 5]
    array[2] = buffer[start + 6]
    array[3] = buffer[start + 7]
    object["bar"] = array;


    start += 8

    return callback(object)
  }
}