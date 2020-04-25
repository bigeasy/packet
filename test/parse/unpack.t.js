require('proof')(2, function (okay) {
    const unpack = require('../../fiddle/unpack') // satisfy coverage
    let f
    f = new Function('value', 'return ' + unpack(16, 4, 8, 'value'))
    okay(f(0x0aa0).toString(16), 'aa', 'unpack')
    console.log(unpack(16, 4, 8))
    console.log(unpack(16, 12, 4))
    f = new Function('value', 'return ' + unpack(16, 12, 4, 'value'))
    okay(f(0x000a).toString(16), 'a', 'unpack no shift')
})
