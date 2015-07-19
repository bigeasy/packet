module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var skip
        var remaining
        var value
        var bite
        var next

        this.parse = function (buffer, start, end) {
            switch (step) {
            case 0:
                skip = 2
                step = 1
            case 1:
                remaining = end - start
                if (remaining < skip) {
                    skip -= remaining
                    return end
                }
                start += skip
            case 2:
                value = 0
                bite = 1
                step = 3
            case 3:
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

        if (end - start < 4) {
            return inc.call(this, buffer, start, end, 0)
        }

        start += 2

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
