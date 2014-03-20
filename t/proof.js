
module.exports = require('proof')(function (counter, equal, deepEqual) {
    var options = {}
    options.precompiler = require('./require')
    options.directory = 't/generated'
    return {
        packet: require('..').createPacketizer(options)
    }
})
