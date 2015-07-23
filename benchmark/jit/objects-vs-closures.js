function Parser (value) {
    this.value = value
}

Parser.prototype.get = function () {
    return this.value
}

function object () {
    new Parser(1).get() === 1
}

function parser (value) {
    return enclosed
    function enclosed () { return value }
}

function closure () {
    parser(1)() === 1
}

function main() {
    for (var i = 0; i < 1000000; i++) {
        closure()
    }

    for (var i = 0; i < 1000000; i++) {
        object()
    }
}

main()
