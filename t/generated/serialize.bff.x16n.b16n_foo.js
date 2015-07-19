module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var step
        var bite
        var next
        var skip
        var remaining
        var value

        this.write = function (buffer, start, end) {
            switch (step) {
            case 0:
                skip = start + 2
                step = 1
            case 1:
                remaining = end - start
                if (remaining < skip) {
                    skip -= remaining
                    return end
                }
                start += skip
            case 2:
                value = object.foo
                bite = 1
                step = 3
            case 3:
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
        var value

        if (end - start < 4) {
            return inc.call(this, buffer, start, end, 0)
        }

        start += 2
        value = object.foo
        buffer[start++] = value >>> 8 & 0xff
        buffer[start++] = value & 0xff

        if (next = callback && callback(object)) {
            this.write = next
            return this.write(buffer, start, end)
        }

        return start
    }
}
