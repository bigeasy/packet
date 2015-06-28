module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var bite
        var next
        var _foo
        var i

        this.parse = function (buffer, start, end) {
            switch (step) {
            case 0:
                _foo = [ 0 ]
                i = 0
                bite = 1
                step = 1
            case 1:
                for (;;) {
                    while (bite != -1) {
                        if (start == end) {
                            return start
                        }
                        _foo[i] += Math.pow(256, bite) * buffer[start++]
                        bite--
                    }
                    if (++i == 4) {
                        break
                    }
                    _foo[i] = 0
                    bite = 1
                }
                object["foo"] = _foo
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
        var array
        var i

        if (end - start < 8) {
            return inc.call(this, buffer, start, end, 0)
        }

        array = []
        for (i = 0; i < 4; i++) {
            array[i] =
                buffer[start++] * 0x100 +
                buffer[start++]
        }
        object["foo"] = array

        if (next = callback(object)) {
            this.parse = next
            return this.parse(buffer, start, end)
        }

        return start
    }
}
