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
              _foo = new ArrayBuffer(4)
              new DataView(_foo).setFloat32(0, object["foo"], true)
              bite = 0
              index = 1
          case 1:
              while (bite != 4) {
                  if (start == end) return start
                  buffer[start++] = _foo[bite++]
              }
          case 2:
              _bar = new ArrayBuffer(4)
              new DataView(_bar).setFloat32(0, object["bar"], true)
              bite = 0
              index = 3
          case 3:
              while (bite != 4) {
                  if (start == end) return start
                  buffer[start++] = _bar[bite++]
              }
          }

          return start
      }

      return this.write(buffer, start, end)
  }

  return function (buffer, start, end) {
      var _foo
      var _bar

      if (end - start < 8) {
          return inc.call(this, buffer, start, end, 0)
      }

      _foo = new ArrayBuffer(4)
      new DataView(_foo).setFloat32(0, object["foo"], true)
      buffer[start] = _foo[0]
      buffer[start + 1] = _foo[1]
      buffer[start + 2] = _foo[2]
      buffer[start + 3] = _foo[3]

      _bar = new ArrayBuffer(4)
      new DataView(_bar).setFloat32(0, object["bar"], true)
      buffer[start + 4] = _bar[0]
      buffer[start + 5] = _bar[1]
      buffer[start + 6] = _bar[2]
      buffer[start + 7] = _bar[3]

      start += 8

      return start
  }
}