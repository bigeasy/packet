module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var bite
      var skip
      var _foo

      this.parse = function (buffer, start, end) {
          switch (index) {

          case 0:
              skip = start + 2
              index = 1
          case 1:
              if (end < skip) return end
              start = skip
          case 2:
              _foo = 0
              bite = 1
              index = 3
          case 3:
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
      if (end - start < 4) {
          return inc.call(this, buffer, start, end, 0)
      }

      object["foo"] =
          buffer[start + 2] * 0x100 +
          buffer[start + 3]

      start += 4


      return callback(object)
  }
}