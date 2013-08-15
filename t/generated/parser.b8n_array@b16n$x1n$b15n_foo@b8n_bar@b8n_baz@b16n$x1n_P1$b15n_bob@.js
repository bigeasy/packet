module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, value, first = start;

    if (end - start < 1) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = buffer[start]
    if (value & 0x80) {
      if (end - start < 2) {
          return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
      }

      pattern.splice.apply(pattern, [0, 1].concat(pattern[0].alternation[0].pattern));
      value =
        buffer[start] * 0x100 +
        buffer[start + 1];

      object["foo"] = (value & (0xffff >> 1)) >> 0;

      start += 2;
    } else {
      if (end - start < 1) {
          return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
      }

      pattern.splice.apply(pattern, [0, 1].concat(pattern[0].alternation[1].pattern));
      object["bar"] = buffer[start]

      start += 1;
    }

    return callback(object)
  }
}