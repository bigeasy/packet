#!/usr/bin/env node
require('./proof')(3, function (serialize) {
    serialize("b16", 0x1FF, 2, [  0x01, 0xFF ], "write a big-endian 16 bit integer");
});
