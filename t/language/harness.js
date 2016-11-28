var fs = require('fs')
var path = require('path')

exports.compile = function (assert, name) {
    var source = fs.readFileSync(path.resolve(__dirname, 'source/' + name + '.packet.js'), 'utf8')
    var parsed = require('../../parser').walk(source)
    console.log(JSON.stringify(parsed, null, 2))
    try {
        var expected = require(path.resolve(__dirname, 'compiled/' + name + '.json'))
    } catch (error) {
        if (error.code != 'MODULE_NOT_FOUND') {
            throw error
        }
        expected = {}
    }
    assert(parsed, expected, name)
}
