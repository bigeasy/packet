const Benchmark = require('benchmark')

const suite = new Benchmark.Suite('async')

function ordered ($) {
    return $.length
}

function named ({ $ }) {
    return $.length
}

const buffer = Buffer.from('hello, world')

for (let i = 1; i <= 4; i++)  {
    suite.add({
        name: 'ordered sliced ' + i,
        fn: function () {
            ordered(buffer.slice(1, 5))
        }
    })
    suite.add({
        name: 'named sliced   ' + i,
        fn: function () {
            named({ $: buffer.slice(1, 5) })
        }
    })
    suite.add({
        name: 'named unsliced ' + i,
        fn: function () {
            named({ $: buffer })
        }
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
