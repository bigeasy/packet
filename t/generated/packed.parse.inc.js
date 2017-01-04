module.exports = function (parsers) {
    parsers.inc.object = function () {
        this.step = 0
        this.stack = [{
            object: null
        }]
    }

    parsers.inc.object.prototype.parse = function (buffer, start, end) {
        var object
        var value
        var frame = this.stack[this.stack.length - 1]

        switch (this.step) {
        case 0:

            this.stack.push({
                object: {
                    first: null,
                    second: null,
                    third: null
                }
            })
            this.stack[this.stack.length - 2].object = this.stack[this.stack.length - 1].object
            this.step = 1

        case 1:

            this.stack.push({
                value: 0,
                bite: 1
            })
            this.step = 2

        case 2:

            frame = this.stack[this.stack.length - 1]

            while (frame.bite != -1) {
                if (start == end) {
                    return { start: start, object: null, parser: this }
                }
                frame.value += Math.pow(256, frame.bite) * buffer[start++]
                frame.bite--
            }

            this.stack.pop()

            value = frame.value

            this.stack[this.stack.length - 1].object.first = value >>> 15 & 0x1
            this.stack[this.stack.length - 1].object.second = value >>> 12 & 0x7
            this.stack[this.stack.length - 1].object.third = value & 0xfff

        case 3:

            return { start: start, object: this.stack[0].object, parser: null }

        }
    }
}
