#!/usr/bin/env node

require('proof')(1, function (deepEqual) {
    var packet = require('../..').createPacketizer()
    var object = {}, self = {}, buffer = new Buffer([ 0x1 ])
    object.parser = packet.createParserProgrammatically()
    self.parse = object.parser({}, function (object) {
        deepEqual(object, { byte: 1 }, 'parse')
    })
    self.parse(buffer, 0, buffer.length)
})
