#!/usr/bin/env node
require('./proof')(10, function (parseEqual) {
    var bytes =  [ 0x01, 0x02, 0x0D, 0x0D, 0x0A, 0x06, 0x07, 0x08 ];
    var field =  bytes.slice(0, 3);
    parseEqual({ require: true }, 'b8[8]z<13,10>', bytes, 8, field, 'read a multiple terminated array of 8 bytes');
    parseEqual({ require: true, subsequent: true }, 'b8[8]z<13,10>', bytes, 8, field, 'read a multiple terminated array of 8 bytes');
    parseEqual({ require: true }, 'b8[8]z<13,10>,b8', bytes.concat(1), 9, field, 1, 'read a multiple terminated array of 8 bytes');
});
