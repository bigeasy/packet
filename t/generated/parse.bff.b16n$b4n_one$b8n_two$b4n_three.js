module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, index) {
        var bite
        var next
        var _undefined

        this.parse = function (buffer, start, end) {
            switch (index) {
            case 0:
                _undefined = 0
                bite = 1
                index = 1
            case 1:
                while (bite != -1) {
                    if (start == end) {
                        return start
                    }
                    _undefined += Math.pow(256, bite) * buffer[start++]
                    bite--
                }
                object[undefined] = _undefined
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

        if (end - start < 2) {
            return inc.call(this, buffer, start, end, 0)
        }

        object[undefined] =
            buffer[start] * 0x100 +
            buffer[start + 1]

        start += 2

        if (next = callback(object)) {
            this.parse = next
            return this.parse(buffer, start, end)
        }

        return start
    }
}
