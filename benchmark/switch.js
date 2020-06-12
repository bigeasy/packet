const Benchmark = require('benchmark')

const suite = new Benchmark.Suite('async')

function switched (select) {
    let value = 0
    switch (select) {
    case 0:
        value = 0
        break
    case 1:
        value = 1
        break
    case 2:
        value = 2
        break
    case 3:
        value = 3
        break
    case 4:
        value = 4
        break
    default:
        value = 5
        break
    }
    return value
}

function laddered (laddered) {
    let value = 0
    if (laddered == 0) {
        value = 0
    } else if (laddered == 1) {
        value = 1
    } else if (laddered == 2) {
        value = 2
    } else if (laddered == 3) {
        value = 3
    } else if (laddered == 4) {
        value = 4
    } else {
        value = 5
    }
    return value
}

const table = [ 0, 1, 2, 3, 4 ]

function tabled (select) {
    return table[select] || 5
}

for (let i = 1; i <= 4; i++)  {
    suite.add({
        name: 'switched ' + i,
        fn: function () {
            for (let i = 0; i <= 5; i++) {
                switched(i)
            }
        }
    })
    suite.add({
        name: 'laddered ' + i,
        fn: function () {
            for (let i = 0; i <= 5; i++) {
                laddered(i)
            }
        }
    })
    suite.add({
        name: 'tabled ' + i,
        fn: function () {
            for (let i = 0; i <= 5; i++) {
                laddered(i)
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
