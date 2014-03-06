require('proof')(8, function (equal) {
    require('../..') // satisfy coverage
    function signage (name, width, bits) {
        var mask = 0xffffffff, test = 1
        mask = mask >>> (32 - bits)
        test = test << bits - 1
        return name + ' & 0x' + test.toString(16) +
            ' ? (0x' + mask.toString(16) + ' - ' + name + ' + 1) * -1 : ' + name
    }

    var f = new Function('value', 'return ' + signage('value', 16, 3))
    console.log(signage('value', 16, 3))
    equal(f(0x7), -1, '-1')
    equal(f(0x6), -2, '-2')
    equal(f(0x5), -3, '-3')
    equal(f(0x4), -4, '-4')
    equal(f(0x3), 3, '3')
    equal(f(0x2), 2, '2')
    equal(f(0x1), 1, '1')
    equal(f(0x0), 0, '0')
})
