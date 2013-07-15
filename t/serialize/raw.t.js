#!/usr/bin/env node

require('./proof')(3, function (serialize) {
    var bytes =  [ 0x01, 0x02, 0x03, 0x04 ];
    serialize('l32a', bytes, 4, bytes, 'write raw bytes as array');
});
