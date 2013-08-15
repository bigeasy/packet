module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  return function (buffer, start, end) {
    var read, value, first = start;

    if (end - start < 1) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    value = buffer[start]
    if (0 <= value && value <= 251) {
    if (end - start < 1) {
        return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
    }

    pattern.splice.apply(pattern, [0, 1].concat(pattern[0].alternation[0].pattern));
      object["foo"] = buffer[start]

      start += 0;
      start += 1;
    } else if (252 == value) {
      if (end - start < 3) {
          return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
      }

      pattern.splice.apply(pattern, [0, 1].concat(pattern[0].alternation[1].pattern));

      object["foo"] =
        buffer[start + 1] * 0x100 +
        buffer[start + 2];


      start += 3;
    } else if (253 == value) {
      if (end - start < 4) {
          return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
      }

      pattern.splice.apply(pattern, [0, 1].concat(pattern[0].alternation[2].pattern));

      object["bar"] =
        buffer[start + 1] * 0x10000 +
        buffer[start + 2] * 0x100 +
        buffer[start + 3];


      start += 4;
    } else if (254 == value) {
      if (end - start < 9) {
          return incremental.call(this, buffer, start, end, pattern, 0, object, callback);
      }

      pattern.splice.apply(pattern, [0, 1].concat(pattern[0].alternation[3].pattern));

      object["baz"] =
        buffer[start + 1] * 0x100000000000000 +
        buffer[start + 2] * 0x1000000000000 +
        buffer[start + 3] * 0x10000000000 +
        buffer[start + 4] * 0x100000000 +
        buffer[start + 5] * 0x1000000 +
        buffer[start + 6] * 0x10000 +
        buffer[start + 7] * 0x100 +
        buffer[start + 8];


      start += 9;
    } else {
      throw new Error("Cannot match branch.");
    }

    return callback(object)
  }
}