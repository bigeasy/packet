module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var step
        var bite
        var next
        var value

        this.write = function (buffer, start, end) {
            switch (step) {
            case 0:
                value = object.foo
                bite = 0
                step = 1
            case 1:
                while (bite != -1) {
                    if (start == end) {
                        return start
                    }
                    buffer[start++] = value >>> bite * 8 & 0xff
                    bite--
                }
            }

            if (next = callback && callback(object)) {
                this.write = next
                return this.write(buffer, start, end)
            }

            return start
        }

        return this.write(buffer, start, end)
    }

    return function (buffer, start, end) {
        var next

        if (end - start < 1) {
            return inc.call(this, buffer, start, end, 0)
        }

        buffer[start++] = object.foo
        if (next = callback && callback(object)) {
            this.write = next
            return this.write(buffer, start, end)
        }

        return start
    }
}
