module.exports = function (parsers) {
    parsers.inc.object = function () {
        this.step = 0
        this.stack = [{
            object: { object: null }
        }]

    }

    parsers.inc.object.prototype.parse = function (buffer, start, end) {

        var frame = this.stack[this.stack.length - 1]

        switch (this.step) {
        case 0:

            this.stack.push({
                object: {

                }
            })
            this.stack[this.stack.length - 2].object.object = this.stack[this.stack.length - 1].object
            this.step = 1

        case 1:

            this.stack.push({
                object: {
                    number: null
                }
            })
            this.stack[this.stack.length - 2].object.header = this.stack[this.stack.length - 1].object
            this.step = 2

        case 2:


            this.stack.push({
                value: 0,
                bite: 1
            })
            this.step = 3

        case 3:

            frame = this.stack[this.stack.length - 1]

            while (frame.bite != -1) {
                if (start == end) {
                    return { start: start, object: null, parser: this }
                }

                frame.value += Math.pow(256, frame.bite) * buffer[start++]
                frame.bite--
            }

            this.stack.pop()

            this.stack[this.stack.length - 1].object.number = frame.value

        case 4:

            return {
                start: start,
                object: this.stack[0].object.object,
                parser: null
            }

        }
    }
}
