var previous = require('./prev')
  , next = require('./next')
  , eq = require('assert').equal
  , deq = require('assert').deepEqual
  , Benchmark = require('benchmark');

var suite = new Benchmark.Suite;



function createBenchmark(createSerializer, createParser) {
  return function () {
    var parser, serializer, buffer = new Buffer(1024), i, I;
    serializer = createSerializer();
    parser = createParser();
    var pattern = 'b16 => a, x16{3}, -b16 => b, b32 => c, -b32 => d, b8 => e, ' +
      '-b8 => f, b32f => g, b32z => h, b32[4] => i';
    serializer.packet('example', pattern);
    parser.packet('example', pattern);
    for (i = 0; i < 27; i++) {
      serializer.reset();
      serializer.serialize('example', 0xffff, -1, 0x7ffffff, -1, 1, -1, 0.1, [ 1, 2, 3, 4 ], [ 1, 2, 3, 4 ])
      serializer.write(buffer);
      parser.reset();
      parser.extract('example', function (record) {
        eq(record.a, 0xffff);
        eq(record.b, -1);
        eq(record.c, 0x7ffffff);
        eq(record.d, -1);
        eq(record.e, 1);
        eq(record.f, -1);
        eq(record.g.toFixed(1), 0.1);
        deq(record.h, [ 1, 2, 3, 4 ]);
        deq(record.i, [ 1, 2, 3, 4 ]);
      });
      parser.parse(buffer);
    }
  }
}

function createSerializer () { return new (previous.Serializer) }
function createParser () { return new (previous.Parser) }

     createBenchmark(next.createSerializer, next.createParser)()

suite.add('previous', createBenchmark(createSerializer, createParser))
     .add('next', createBenchmark(next.createSerializer, next.createParser))
     .on('cycle', function(event) { console.log(String(event.target)); })
     .on('complete', function() {
        var fastest = this.filter('fastest'), slowest = this.filter('slowest');
        var percent = (1 - (slowest[0].hz / fastest[0].hz)) * 100;
        var adjective = fastest.pluck('name') == 'next' ? 'faster' : 'slower';
        console.log('%d%% ' + adjective, percent.toFixed(2)); 
     })
     .run();
