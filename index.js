var previous = require('./prev')
  , next = require('./next')
  , eq = require('assert').equal
  , Benchmark = require('benchmark');

var suite = new Benchmark.Suite;



function createBenchmark(createSerializer, createParser) {
  return function () {
    var parser, serializer, buffer = new Buffer(1024), i, I;
    serializer = createSerializer();
    parser = createParser();
    serializer.packet('example', 'b16 => a, x16{3}, -b16 => b, b32 => c, -b32 => d, b8 => e, -b8 => f')
    parser.packet('example', 'b16 => a, x16{3}, -b16 => b, b32 => c, -b32 => d, b8 => e, -b8 => f')
    for (i = 0; i < 27; i++) {
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
