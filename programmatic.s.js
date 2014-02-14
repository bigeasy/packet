exports.parser = function () {
    return function (object, callback) {
        var inc

        inc = function (buffer, start, end, index) {
            var next
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

                if (next = callback(object)) {
                    this.parse = next
                    return this.parse(buffer, start, end)
                }

                return start
            }

            return this.parse(buffer, start, end)
        }

        return function (buffer, start, end) {
            var next

            if (end - start < 1) {
                return inc.call(this, buffer, start, end, 0)
            }

            object["byte"] = buffer[start]

            start += 1

            if (next = callback(object)) {
                this.parse = next
                return this.parse(buffer, start, end)
            }

            return start
        }
    }
}
