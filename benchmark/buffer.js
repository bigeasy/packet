const Benchmark = require('benchmark')

const suite = new Benchmark.Suite('async')

function buffered () {
    const buffer = Buffer.allocUnsafe(1024)
    for (let i = 0; i < 1024; i++) {
        buffer[i] = i % 256
    }
    for (let i = 0; i < 512; i++) {
        const j = buffer[1023 - i]
        buffer[1023 - i] = buffer[i]
        buffer[i] = j
    }
}

function arrayed () {
    const array = new Array(1024)
    for (let i = 0; i < 1024; i++) {
        array[i] = i % 256
    }
    for (let i = 0; i < 512; i++) {
        const j = array[1023 - i]
        array[1023 - i] = array[i]
        array[i] = j
    }
}

function named ({ $ }) {
    return $.length
}

const buffer = Buffer.from('hello, world')

for (let i = 1; i <= 4; i++)  {
    suite.add({
        name: 'buffered ' + i,
        fn: function () {
            buffered()
        }
    })
    suite.add({
        name: 'arrayed ' + i,
        fn: function () {
            arrayed()
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
