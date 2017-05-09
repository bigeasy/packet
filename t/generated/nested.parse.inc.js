module.exports = function (parsers) {
    parsers.inc.object = function () {
        this.step = 0
        this.stack = [{
            object: { object: null }
        }]
    }

    parsers.inc.object.prototype.parse = function (buffer, start, end) {
        var frame = this.stack[this.stack.length - 1]

        for (;;) {

            switch (this.step) {
            case 0:

                this.stack.push({
                    object: {
                        values: new Array
                    }
                })
                this.stack[this.stack.length - 2].object.object = this.stack[this.stack.length - 1].object
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

                this.stack[this.stack.length - 1].length = frame.value


                this.stack[this.stack.length - 1].index = 0
            case 3:

                this.stack.push({
                    object: {
                        key: null,
                        value: null
                    }
                })
                this.step = 4

            case 4:

                this.stack.push({
                    value: 0,
                    bite: 1
                })
                this.step = 5

            case 5:

                frame = this.stack[this.stack.length - 1]

                while (frame.bite != -1) {
                    if (start == end) {
                        return { start: start, object: null, parser: this }
                    }
                    frame.value += Math.pow(256, frame.bite) * buffer[start++]
                    frame.bite--
                }

                this.stack.pop()

                this.stack[this.stack.length - 1].object.key = frame.value


            case 6:

                this.stack.push({
                    value: 0,
                    bite: 1
                })
                this.step = 7

            case 7:

                frame = this.stack[this.stack.length - 1]

                while (frame.bite != -1) {
                    if (start == end) {
                        return { start: start, object: null, parser: this }
                    }
                    frame.value += Math.pow(256, frame.bite) * buffer[start++]
                    frame.bite--
                }

                this.stack.pop()

                this.stack[this.stack.length - 1].object.value = frame.value


                frame = this.stack[this.stack.length - 2]
                frame.object.values.push(this.stack.pop().object)
                if (++frame.index != frame.length) {
                    this.step = 3
                    continue
                }
                this.step = 8

            case 8:

                return {
                    start: start,
                    object: this.stack[0].object.object,
                    parser: null
                }

            }

            break
        }
    }
}
