module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var bite
      var _foo
      var _bar

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
              object["foo"] = _foo
          case 2:
              _bar = 0
              bite = 0
              index = 3
          case 3:
              while (bite != -1) {
                  if (start == end) return start
                  _bar += Math.pow(256, bite) * buffer[start++]
                  bite--
              }
              object["bar"] = _bar
          }

          // todo: all wrong
          return callback(object)
      }

      return this.parse(buffer, start, end)
  }

  return function (buffer, start, end) {
      if (end - start < 3) {
          return inc.call(this, buffer, start, end, 0)
      }

      object["foo"] =
          buffer[start] +
          buffer[start + 1] * 0x100

      object["bar"] = buffer[start + 2]

      start += 3


      return callback(object)
  }
}