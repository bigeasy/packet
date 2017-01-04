module.exports = function (parsers) {
    parsers.inc.object = function () {
        this.step = 0
        this.stack = [{
            object: null
        }]
    }

    parsers.inc.object.prototype.parse = function (buffer, start, end) {
        var object
        var frame = this.stack[this.stack.length - 1]

        for (;;) {

            switch (this.step) {
            case 0:

                this.stack.push({
                    object: {
                        flag: null
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

                this.stack[this.stack.length - 1].object.flag = frame.value


                frame = this.stack[this.stack.length - 1]
                object = this.stack[0].object

                if (object.flag == 16) {

                    this.step = 3
                    continue

                } else {

                    this.step = 5
                    continue

                }

            case 3:

                this.stack.push({
                    value: 0,
                    bite: 1
                })
                this.step = 4

            case 4:

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

                this.step = 7
                continue

            case 5:

                this.stack.push({
                    value: 0,
                    bite: 0
                })
                this.step = 6

            case 6:

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

                this.step = 7
                continue

            case 7:

                return { start: start, object: this.stack[0].object, parser: null }

            }

            break
        }
    }
}
