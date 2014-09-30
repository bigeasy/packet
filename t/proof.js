require('proof')(module, function (body, assert) {
    var options = {}
    options.precompiler = require('./require')
    options.directory = 't/generated'
    body(require('..').createPacketizer(options), assert)
})
