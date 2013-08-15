module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var bite
      var _foo

      this.parse = function (buffer, start, end) {
          switch (index) {
          case 0:
              _foo = 0
              bite = 1
              index = 1
          case 1:
              while (bite != -1) {
                  if (start == end) return start
                  _foo += Math.pow(256, bite) * buffer[start++]
                  bite--
              }
              object["foo"] = _foo
          }

          // todo: all wrong
          return callback(object)
      }

      return this.parse(buffer, start, end)
  }

  return function (buffer, start, end) {
      if (end - start < 2) {
          return inc.call(this, buffer, start, end, 0)
      }

      object["foo"] =
          buffer[start] * 0x100 +
          buffer[start + 1]

      start += 2


      return callback(object)
  }
}