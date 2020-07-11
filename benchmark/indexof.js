const Benchmark = require('benchmark')

const suite = new Benchmark.Suite('async')

const buffer = Buffer.alloc(4096)
buffer[buffer.length - 1] = 1

function loop (buffer) {
    for (let i = 0, I = buffer.length; i < I; i++) {
        if (buffer[i] == 1) {
            return i
        }
    }
    return -1
}

function indexOf (buffer) {
    return buffer.indexOf(1)
}

for (let i = 1; i <= 4; i++)  {
    suite.add({
        name: 'loop    ' + i,
        fn: function () {
            loop(buffer)
        }
    })
    suite.add({
        name: 'indexOf ' + i,
        fn: function () {
            indexOf(buffer)
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
