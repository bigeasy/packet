module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var index
      var bite
      var value
      var _foo

      this.write = function (buffer, start, end) {
          switch (index) {
          case 0:
              _foo = object["foo"]
              if (_foo < 0)
                  _foo = 0x7 + _foo + 1
              value = _foo << 3
              bite = 0
              index = 1
          case 1:
              while (bite != -1) {
                   if (start == end) return start
                   buffer[start++] = (value >>> bite * 8) & 0xff
                   bite--
               }
          }

          return start
      }

      return this.write(buffer, start, end)
  }

  return function (buffer, start, end) {
      var value
      var _foo

      if (end - start < 1) {
          return inc.call(this, buffer, start, end, 0)
      }

      _foo = object["foo"]
      if (_foo < 0)
          _foo = 0x7 + _foo + 1
      value = _foo << 3
      buffer[start] = value & 0xff

      start += 1

      return start
  }
}