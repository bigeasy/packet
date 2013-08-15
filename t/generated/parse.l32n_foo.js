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
              while (bite != 4) {
                  if (start == end) return start
                  _foo += Math.pow(256, bite) * buffer[start++]
                  bite++
              }
              object["foo"] = _foo
          }

          // todo: all wrong
          return callback(object)
      }

      return this.parse(buffer, start, end)
  }

  return function (buffer, start, end) {
      if (end - start < 4) {
          return inc.call(this, buffer, start, end, 0)
      }

      object["foo"] =
          buffer[start] +
          buffer[start + 1] * 0x100 +
          buffer[start + 2] * 0x10000 +
          buffer[start + 3] * 0x1000000

      start += 4


      return callback(object)
  }
}