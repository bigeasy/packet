module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var bite
      var _byte

      this.parse = function (buffer, start, end) {
          switch (index) {
          case 0:
              _byte = 0
              bite = 0
              index = 1
          case 1:
              while (bite != -1) {
                  if (start == end) return start
                  _byte += Math.pow(256, bite) * buffer[start++]
                  bite--
              }
              object["byte"] = _byte
          }

          // todo: all wrong
          return callback(object)
      }

      return this.parse(buffer, start, end)
  }

  return function (buffer, start, end) {
      if (end - start < 1) {
          return inc.call(this, buffer, start, end, 0)
      }

      object["byte"] = buffer[start]

      start += 1


      return callback(object)
  }
}