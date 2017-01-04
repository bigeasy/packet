module.exports = function (parsers) {
    parsers.inc.object = function () {
        this.step = 0
        this.stack = [{
            object: null
        }]
    }

    parsers.inc.object.prototype.parse = function (buffer, start, end) {
        var frame = this.stack[this.stack.length - 1]

        switch (this.step) {
        case 0:

            this.stack.push({
                object: {
                    word: null
                }
            })
            this.stack[this.stack.length - 2].object = this.stack[this.stack.length - 1].object
            this.step = 1

        case 1:

            this.stack.push({
                value: 0,
                bite: 0
            })
            this.step = 2

        case 2:

            frame = this.stack[this.stack.length - 1]

            while (frame.bite != 2) {
                if (start == end) {
                    return { start: start, object: null, parser: this }
                }
                frame.value += Math.pow(256, frame.bite) * buffer[start++]
                frame.bite++
            }

            this.stack.pop()

            this.stack[this.stack.length - 1].object.word = frame.value

        case 3:

            return { start: start, object: this.stack[0].object, parser: null }

        }
    }
}
