const Benchmark = require('benchmark')

const suite = new Benchmark.Suite('async')

function one (select, value) {
    let x = 0
    switch (select) {
    case 0:

        x = value >>> 1 === value ? 0 : 1

        return x + value

    }
}

function two (select, value) {
    let x = 0
    switch (select) {
    case 0:

        x = value >>> 1 === value ? 0 : 1

    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:

    case 8:

        return x + value

    }
}

for (let i = 1; i <= 4; i++)  {
    suite.add({
        name: 'one ' + i,
        fn: function () {
            for (let i = 0; i <= 5; i++) {
                one(0, i)
            }
        }
    })
    suite.add({
        name: 'two ' + i,
        fn: function () {
            for (let i = 0; i <= 5; i++) {
                two(0, i)
            }
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
