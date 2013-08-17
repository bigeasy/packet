module.exports = function (object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var index
      var bite
      var _foo

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
          }

          return start
      }

      return this.write(buffer, start, end)
  }

  return function (buffer, start, end) {
      if (end - start < 1) {
          return inc.call(this, buffer, start, end, 0)
      }

      buffer[start] = object["foo"]

      start += 1

      return start
  }
}