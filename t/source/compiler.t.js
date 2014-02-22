var newlines = '\
a = 1\n\nb = 2'

var hoist = '\
var a\n\
var b\n\
\n\
a = 1\n\
b = 2'

require('proof')(1, function (equal) {
    var compiler = require('../../compiler')
    var pretty = require('../../prettify')
    var source = compiler([ 'a = 1', '\n', 'b = 2' ])
    equal(pretty(source), newlines, 'new lines')
    var source = compiler([ 'a = 1', 'var a;', 'var a;', 'var b;', 'b = 2' ])
    equal(pretty(source), hoist, 'hoisting')
})
