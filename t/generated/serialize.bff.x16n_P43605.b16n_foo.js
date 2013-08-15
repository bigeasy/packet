module.exports = function (incremental, terminator, pattern, transforms, ieee754, object, callback) {
  var inc

  inc = function (buffer, start, end, index) {
      var index
      var bite
      var value
      var _foo

      this.write = function (buffer, start, end) {
          switch (index) {
          case 0:
              value = 0xaa55
              bite = 1
              index = 1
          case 1:
              while (bite != -1) {
                   if (start == end) return start
                   buffer[start++] = (value >>> bite * 8) & 0xff
                   bite--
               }
          case 2:
              _foo = object["foo"]
              bite = 1
              index = 3
          case 3:
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
      var value

      if (end - start < 4) {
          return inc.call(this, buffer, start, end, 0)
      }

      value = 0xaa55
      buffer[start] = (value >>> 8) & 0xff
      buffer[start + 1] = value & 0xff

      value = object["foo"]
      buffer[start + 2] = (value >>> 8) & 0xff
      buffer[start + 3] = value & 0xff

      start += 4

      return start
  }
}