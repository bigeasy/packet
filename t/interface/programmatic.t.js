#!/usr/bin/env node

require('proof')(1, function (ok) {
    var packet = require('../..').createPacketizer()
    ok(packet.createParserProgrammatically(), 'require')
})
