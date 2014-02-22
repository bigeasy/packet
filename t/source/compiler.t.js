var newlines = '\
a = 1\n\nb = 2'

require('proof')(1, function (equal) {
    var compiler = require('../../compiler')
    var pretty = require('../../prettify')
    var source = compiler([ 'a = 1', '\n', 'b = 2' ])
    equal(pretty(source), newlines, 'new lines')
})
