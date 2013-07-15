#!/usr/bin/env node

require('./proof')(9, function (parseEqual) {
  parseEqual({ require: true }, 'b8z|utf8() => phonetic, b16 => charCode, b32 => index', [
    0x41, 0x42, 0x43, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01 ], 10, {
      phonetic: 'ABC',
      charCode: 0x100,
      index: 1
  }, 'read chunk record');
  parseEqual({ require: true, subsequent: true }, 'b8z|utf8() => phonetic, b16 => charCode, b32 => index', [
    0x41, 0x42, 0x43, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0xa1 ], 10, {
      phonetic: 'ABC',
      charCode: 0x100,
      index: 0xa1
  }, 'read chunk record, subsequent');
  parseEqual({ require: true }, 'b32 => count', [
     0x00, 0x01, 0x00, 0x00, 0x00 ], 4, {
      count: 0x10000,
  }, 'read a zero terminated 8 byte padded ASCII string');
});
