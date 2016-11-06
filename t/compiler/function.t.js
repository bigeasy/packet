require('proof')(1, prove)

function prove (assert) {
    var compiler = require('../../function')
    assert(compiler('ignore', 'return 0xaaaa')(), 0xaaaa, 'compile with Function')
}
