var blanks = '\
a = 1\nb = 2'

var newlines = '\
a = 1\n\nb = 2'

var hoist = '\
var a\n\
var b\n\
\n\
a = 1\n\
b = 2'

require('proof')(4, function (equal) {
    var compiler = require('../../compiler')
    var pretty = require('../../prettify'), source
    source = compiler([ 'a = 1', ' ', 'b = 2' ])
    equal(pretty(source), blanks, 'strip blank lines')
    source = compiler([ 'a = 1', '"__nl__"', 'b = 2' ])
    equal(pretty(source), newlines, 'new lines')
    source = compiler([ 'a = 1', 'var a;', 'var a;', 'var b;', 'b = 2' ])
    equal(pretty(source), hoist, 'hoisting')
    source = compiler([ [ 'a = 1', [[[ 'var a;' ]]] ], 'var a;', 'var b;', 'b = 2' ])
    equal(pretty(source), hoist, 'nested')
})
