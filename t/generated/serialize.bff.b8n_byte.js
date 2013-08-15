module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var index
      var bite
      var _byte

      this.write = function (buffer, start, end) {
          switch (index) {
          case 0:
              _byte = object["byte"]
              bite = 0
              index = 1
          case 1:
              while (bite != -1) {
                   if (start == end) return start
                   buffer[start++] = (_byte >>> bite * 8) & 0xff
                   bite--
               }
          }

          return start
      }

      return this.write(buffer, start, end)
  }

  return function (buffer, start, end) {
      if (end - start < 1) {
          return inc.call(this, buffer, start, end, 0)
      }

      buffer[start] = object["byte"]

      start += 1

      return start
  }
}