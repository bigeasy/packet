require('proof')(1, prove)

function prove (assert) {
    require('./harness').compile(assert, 'minimal')
}
