var previous = require('./prev'), next = require('./next'), eq = require('assert').equal;

function createBenchmark(packet) {
  return function () {
    var parser, serializer, buffer = new Buffer(1024), i, I;
    for (i = 0; i < 7; i++) {
      serializer = new (packet.Serializer);
      serializer.packet('example', 'b16 => a, -b16 => b, b32 => c, -b32 => d, b8 => e, -b8 => f')
      serializer.serialize('example', 0xffff, -1, 0x7ffffff, -1, 1, -1)
      serializer.write(buffer);
      parser = new (packet.Parser);
      parser.packet('example', 'b16 => a, -b16 => b, b32 => c, -b32 => d, b8 => e, -b8 => f')
      parser.extract('example', function (record) {
        eq(0xffff, record.a);
        eq(-1, record.b);
        eq(0x7ffffff, record.c);
        eq(-1, record.d);
        eq(1, record.e);
        eq(-1, record.f);
      });
      parser.parse(buffer);
    }
  }
}

function createResetBenchmark(packet) {
  return function () {
    var parser, serializer, buffer = new Buffer(1024), i, I;
    serializer = new (packet.Serializer);
    parser = new (packet.Parser);
    serializer.packet('example', 'b16 => a, -b16 => b, b32 => c, -b32 => d, b8 => e, -b8 => f')
    parser.packet('example', 'b16 => a, -b16 => b, b32 => c, -b32 => d, b8 => e, -b8 => f')
    for (i = 0; i < 7; i++) {
      serializer.reset();
      serializer.serialize('example', 0xffff, -1, 0x7ffffff, -1, 1, -1)
      serializer.write(buffer);
      parser.reset();
      parser.extract('example', function (record) {
        eq(0xffff, record.a);
        eq(-1, record.b);
        eq(0x7ffffff, record.c);
        eq(-1, record.d);
        eq(1, record.e);
        eq(-1, record.f);
      });
      parser.parse(buffer);
    }
  }
}

createBenchmark(previous)();
createResetBenchmark(next)();

exports.compare =
{ 'previous': createBenchmark(previous)
, 'next': createResetBenchmark(next)
};

require('bench').runMain();
