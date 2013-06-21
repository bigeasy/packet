#!/usr/bin/env node

require('proof')(1, function (createSerializer, deepEqual) {
  var alphabet = "Alfa Bravo Charlie Delta \
                  Echo Foxtrot Golf Hotel India Juliet \
                  Kilo Lima Mike November Oscar Papa Quebec \
                  Romeo Sierra Tango Uniform Victor Whiskey \
                  Xray Yankee Zulu";

  var records = alphabet.split(/\s+/).map(function (phonetic, index) {
    return { phonetic: phonetic,
             charCode: phonetic.charCodeAt(0),
             index: index };
  });

  var createSerializer = require('../..').createSerializer;
  var serializer = createSerializer();

  serializer.packet("header", "b32 => count");
  serializer.packet("record", "b8z|utf8() => phonetic, b16 => charCode, b32 => index");

  var parser = serializer.createParser();

  var chunk = new Buffer(32);
  var outgoing = records.slice(0), incoming = [];

  // Serializer writes a header, parser looks for a header.
  serializer.serialize("header", { count: records.length }, send);
  parser.extract("header", head);

  // Serializer writes a chunk, parser parsers a chunk.
  var count;
  while ((count = serializer.write(chunk)) != 0) {
    parser.parse(chunk, 0, count);
  }

  // Send the next record if there is one remaning.
  function send () {
    if (outgoing.length) {
      serializer.serialize("record", outgoing.shift(), send);
    }
  }

  // Get the header, then read the number of record specified in the header's
  // count field.
  function head (header) {
    parser.extract("record", get);
    function get (record) {
      incoming.push(record);
      if (--header.count > 0) parser.extract("record", get);
      else deepEqual(incoming, records, "streamed");
    }
  }
});
