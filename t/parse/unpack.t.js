require('proof')(2, function (equal) {
    var unpack = require('../../_unpack') // satisfy coverage
    var f = new Function('value', 'return ' + unpack(16, 4, 8))
    equal(f(0x0aa0).toString(16), 'aa', 'unpack')
    console.log(unpack(16, 4, 8))
    console.log(unpack(16, 12, 4))
    var f = new Function('value', 'return ' + unpack(16, 12, 4))
    equal(f(0x000a).toString(16), 'a', 'unpack no shift')
})
