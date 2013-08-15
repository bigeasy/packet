module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var bite
      var _foo

      this.parse = function (buffer, start, end) {
          switch (index) {
          case 0:
              _foo = 0
              bite = 0
              index = 1
          case 1:
              while (bite != 2) {
                  if (start == end) return start
                  _foo += Math.pow(256, bite) * buffer[start++]
                  bite++
              }
              _foo = (_foo & 0x8000) ? (0xffff - _foo + 1) * -1 : _foo
              object["foo"] = _foo
          }

          // todo: all wrong
          return callback(object)
      }

      return this.parse(buffer, start, end)
  }

  return function (buffer, start, end) {
      var _foo

      if (end - start < 2) {
          return inc.call(this, buffer, start, end, 0)
      }

      _foo =
          buffer[start] +
          buffer[start + 1] * 0x100
      _foo = (_foo & 0x8000) ? (0xffff - _foo + 1) * -1 : _foo
      object["foo"] = _foo

      start += 2

      return callback(object)
  }
}