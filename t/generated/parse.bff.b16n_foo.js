module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var value
        var bite
        var next

        this.parse = function (buffer, start, end) {
            switch (step) {
            case 0:
                value = 0
                bite = 1
                step = 1
            case 1:
                while (bite != -1) {
                    if (start == end) {
                        return start
                    }
                    value += Math.pow(256, bite) * buffer[start++]
                    bite--
                }
                object.foo = value
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

        object.foo =
            buffer[start++] * 0x100 +
            buffer[start++]

        if (next = callback(object)) {
            this.parse = next
            return this.parse(buffer, start, end)
        }

        return start
    }
}
