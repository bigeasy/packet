module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, array;

    if (end - start < 3) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    array = new Array(3);
    array[0] = buffer[start]
    array[1] = buffer[start + 1]
    array[2] = buffer[start + 2]
    array = transforms.ascii(true, null, array);
    object["foo"] = array;


    start += 3

    return callback(object)
  }
}