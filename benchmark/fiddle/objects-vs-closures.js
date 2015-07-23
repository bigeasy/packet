var Benchmark = require('benchmark')

var suite = new Benchmark.Suite

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
    return function () { return value }
}

function closure () {
    parser(1)() === 1
}

suite.add({
    name: 'object',
    fn: object
})

suite.add({
    name: 'closure',
    fn: closure
})

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})

suite.run()
