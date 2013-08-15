module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, array;

    if (end - start < 8) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    array = new Array(8);
    array[0] = buffer[start]
    array[1] = buffer[start + 1]
    array[2] = buffer[start + 2]
    array[3] = buffer[start + 3]
    array[4] = buffer[start + 4]
    array[5] = buffer[start + 5]
    array[6] = buffer[start + 6]
    array[7] = buffer[start + 7]
    object["foo"] = array;


    start += 8

    return callback(object)
  }
}