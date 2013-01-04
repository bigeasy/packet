#!/usr/bin/env node
require('./proof')(3, function (serialize) {
    serialize("l16", 0x1FF, 2, [ 0xFF, 0x01 ], "write a little-endian 16 bit integer");
});
