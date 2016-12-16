module.exports = function (parsers) {
    parsers.inc.object = function () {
        this.step = 0
        this.stack = [{
            object: this.object = {
                number: null
            },
            array: null,
            index: 0,
            length: 0
        }]
        this.cache = null
    }

    parsers.inc.object.prototype.parse = function (buffer, start, end) {

        var frame = this.stack[this.stack.length - 1]

        for (;;) {

            switch (this.step) {
            case 0:

                this.cache = []
                this.stack.push({
                    value: 0,
                    bite: 0
                })
                this.step = 1

            case 1:

                frame = this.stack[this.stack.length - 1]

                while (frame.bite != -1) {
                    if (start == end) {
                        return { start: start, object: null, parser: this }
                    }
                    this.cache.push(buffer[start])
                    frame.value += Math.pow(256, frame.bite) * buffer[start++]
                    frame.bite--
                }

                this.stack.pop()

                this.stack[this.stack.length - 1].select = frame.value

                frame = this.stack[this.stack.length - 1]

                if (frame.select & 0x80) {

                    this.step = 2
                    this.parse(this.cache, 0, this.cache.length)
                    continue

                } else {

                    this.step = 4
                    this.parse(this.cache, 0, this.cache.length)
                    continue

                }

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

                this.step = 6
                continue

            case 4:

                this.stack.push({
                    value: 0,
                    bite: 0
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

                this.stack[this.stack.length - 1].object.number = frame.value

                this.step = 6
                continue

            case 6:

                return { start: start, object: this.object, parser: null }

            }

            break
        }
    }
}
