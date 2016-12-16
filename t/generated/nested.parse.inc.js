module.exports = function (parsers) {
    parsers.inc.object = function () {
        this.step = 0
        this.stack = [{
            object: this.object = {
                values: new Array
            },
            array: null,
            index: 0,
            length: 0
        }]
    }

    parsers.inc.object.prototype.parse = function (buffer, start, end) {

        var frame = this.stack[this.stack.length - 1]

        for (;;) {

            switch (this.step) {
            case 0:

                this.stack.push({
                    value: 0,
                    bite: 1
                })
                this.step = 1

            case 1:

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

            case 2:

                this.stack.push({
                    object: {
                        key: null,
                        value: null
                    }
                })

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

                this.stack[this.stack.length - 1].object.key = frame.value


            case 5:

                this.stack.push({
                    value: 0,
                    bite: 1
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

                this.stack[this.stack.length - 1].object.value = frame.value


                frame = this.stack[this.stack.length - 2]
                frame.object.values.push(this.stack.pop().object)
                if (++frame.index != frame.length) {
                    this.step = 2
                    continue
                }
                this.step = 7

            case 7:

                return { start: start, object: this.object, parser: null }

            }

            break
        }
    }
}
