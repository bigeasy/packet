module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var index
      var bite
      var _foo
      var _bar

      this.write = function (buffer, start, end) {
          switch (index) {
          case 0:
              _foo = object["foo"]
              bite = 0
              index = 1
          case 1:
              while (bite != -1) {
                   if (start == end) return start
                   buffer[start++] = (_foo >>> bite * 8) & 0xff
                   bite--
               }
          case 2:
              _bar = new ArrayBuffer(8)
              new DataView(_bar).setFloat64(0, object["bar"], true)
              bite = 0
              index = 3
          case 3:
              while (bite != 8) {
                  if (start == end) return start
                  buffer[start++] = _bar[bite++]
              }
          }

          return start
      }

      return this.write(buffer, start, end)
  }

  return function (buffer, start, end) {
      var _bar

      if (end - start < 9) {
          return inc.call(this, buffer, start, end, 0)
      }

      buffer[start] = object["foo"]

      _bar = new ArrayBuffer(8)
      new DataView(_bar).setFloat64(0, object["bar"], true)
      buffer[start + 1] = _bar[0]
      buffer[start + 2] = _bar[1]
      buffer[start + 3] = _bar[2]
      buffer[start + 4] = _bar[3]
      buffer[start + 5] = _bar[4]
      buffer[start + 6] = _bar[5]
      buffer[start + 7] = _bar[6]
      buffer[start + 8] = _bar[7]

      start += 9

      return start
  }
}