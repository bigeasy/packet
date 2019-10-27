require('proof')(1, prove)

function prove (assert) {
    var path = require('path')
    var compiler = require('../../require')
    var filename = path.resolve(__filename, '../../generated/required.js')
    assert(compiler('ignore', filename)('return 0xaaaa')(), 0xaaaa, 'compile with require')
}
