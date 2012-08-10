// Require the necessary Packet sibling modules.
var parse   = require("./pattern");
var Packet  = require("./packet");
var ieee754   = require("./ieee754");
var util = require("util");

  function die () {
    console.log.apply(console, [].slice.call(arguments, 0));
    return process.exit(1);
  }

  function say () { return console.log.apply(console, [].slice.call(arguments, 0)) }
//#### Parser

// Construct a `Parser` that will use the given `self` object as the `this` when
// a callback is called. If no `self` is provided, the `Serializer` instance
// will be used as the `this` object for serialization event callbacks.
function Parser (self) {
  // Get the number of bytes read since the last call to `@reset()`. 
  this.__defineGetter__('read', function () { return this._bytesRead });
  Packet.call(this, self)
}

// The `Parser` reads binary data from a stream and converts it into JavaScript
// primitives, Strings and arrays of JavaScript primitives.
util.inherits(Parser, Packet);

Parser.prototype.writable = true;

// Initialize the next field pattern in the serialization pattern array, which
// is the pattern in the array `@_pattern` at the current `@_patternIndex`.
Parser.prototype._nextField = function ()  {
  var pattern           = this._pattern[this._patternIndex];
  this._repeat      = pattern.repeat;
  this._index       = 0;
  this._skipping    = null;
  this._terminated  = ! pattern.terminator;
  this._terminator  = pattern.terminator && pattern.terminator[pattern.terminator.length - 1];
  this._named       = this._named || !! pattern.name;
  if (pattern.arrayed && pattern.endianness  != "x") this._arrayed = [];
}

// Prepare the parser to parse the next value in the input stream.  It
// initializes the value to a zero integer value or an array.  This method
// accounts for skipping, for skipped patterns.
Parser.prototype._nextValue = function () {
  // Get the next pattern.
  var pattern = this._pattern[this._patternIndex], value;

  // If skipping, skip over the count of bytes.
  if (pattern.endianness == "x") {
    this._skipping  = pattern.bytes;

  // Create the empty value and call the inherited `@_nextValue`.
  } else {
    value = pattern.exploded ? [] : 0;
  }
  Packet.prototype._nextValue.call(this, value);
}

// Set the next packet to parse by providing a named packet name or a packet
// pattern, with an optional `callback`. The optional `callback` will override
// the callback assigned to a named pattern.
Parser.prototype.extract = function (nameOrPattern, callback) {
  this._nameOrPattern(nameOrPattern, callback);
  this._fields      = [];

  this._nextField();
  this._nextValue();
}

//#### parser.skip(length[, callback])

// Skip a region of input stream, invoking the given `callback` when `length`
// bytes have been skipped. The callback will be invoked with the flexible
// `this` object.
Parser.prototype.skip = function (length, callback) {
  this._callback = callback;
  // Create a bogus pattern to enter the parse loop where the stream is fed in
  // the skipping branch.
  this._pattern      = [ {} ];
  this._terminated   = true
  this._index        = 0;
  this._repeat       = 1;
  this._patternIndex = 0;
  this._fields       = [];

  this._skipping     = length;
}

//#### parser.stream(length[, callback])

// Construct a readable stream that will read `length` bytes from the stream
// and invoke the given `callback` when the bytes have been read.
// 
// A zero `length` will confuse the `parse` loop, so we call the `callback`
// immediately.
Parser.prototype.stream = function (length, callback) {
  if (length > 0) {
    this.skip(length, callback);
    this._stream = new (require("./readable").ReadableStream)(this, length, callback);
  } else {
    callback();
  }
}
  
//#### parser.write(buffer[, encoding])

// Parse the `Buffer` or `String` given in `buffer`. If `buffer` is a string it
// is decoded using the given `encoding` or UTF-8 if no encoding is specified.
//
// If the stream is paused by a pattern callback, this method will return
// `false`, to indicate that the parser is no longer capable of accepting data.
Parser.prototype.write = function (buffer, encoding) {
  if (typeof buffer == "string") {
    buffer = new Buffer(buffer, encoding || "utf8");
  }
  this.parse(buffer, 0, buffer.length);
}

//#### parser.parse(buffer[, offset][, length])
// The `parse` method reads from the buffer, returning when the current pattern
// is read, or the end of the buffer is reached.
//
// If the stream is paused by a pattern callback, this method will return
// `false`, to indicate that the parser is no longer capable of accepting data.

// Read from the `buffer` for the given `offset` `and length`.
Parser.prototype.parse = function (buffer, offset, length) {
  // If we are paused, freak out.
  if (this._paused)
    throw new Error("cannot write to paused parser");

  // Initialize the loop counters. Initialize unspecified parameters with their
  // defaults.
  var offset  = offset || 0
    , length  = length || buffer.length
    , start   = this._bytesRead
    , end     = offset + length
    , bytes, value, field
    ;

  // We set the pattern to null when all the fields have been read, so while
  // there is a pattern to fill and bytes to read.
  while (this._pattern != null && offset < end) {
    field = this._pattern[this._patternIndex];
    // If we are skipping, we advance over all the skipped bytes or to the end
    // of the current buffer.
    if (this._skipping != null) {
      var advance  = Math.min(this._skipping, end - offset);
      var begin    = offset;
      offset      += advance;
      this._skipping  -= advance;
      this._bytesRead += advance;
      // If feeding a stream is done through skipping. Skipping and the
      // presence of a stream is how skipping is done.
      if (this._stream) {
        if (Array.isArray(buffer))
          slice = new Buffer(buffer.slice(begin, begin + advance))
        else
          slice = buffer.slice(begin, begin + advance)
        this._stream._write(slice);
        if (! this._skipping)
          this._stream._end()
      }
      // If we have more bytes to skip, then return `true` because we've
      // consumed the entire buffer.
      if (this._skipping)
        return true
      else
        this._skipping = null

    } else {
      // If the pattern is exploded, the value we're populating is an array.
      if (field.exploded) {
        for (;;) {
          var b = buffer[offset];
          this._bytesRead++;
          offset++;
          this._value[this._offset] = b;
          this._offset += this._increment;
          if (this._offset == this._terminal) break;
          if (offset == end) return true;
        }
      // Otherwise we're packing bytes into an unsigned integer, the most
      // common case.
      } else {
        for (;;) {
          b = buffer[offset];
          this._bytesRead++;
          offset++;
          this._value += Math.pow(256, this._offset) * b
          this._offset += this._increment
          if (this._offset == this._terminal) break;
          if (offset == end) return true;
        }
      }
      // Unpack the field value. Perform our basic transformations. That is,
      // convert from a byte array to a JavaScript primitive.
      //
      // Resist the urge to implement these conversions with pipelines. It keeps
      // occuring to you, but those transitions are at a higher level of
      // abstraction, primairly for operations on gathered byte arrays. These
      // transitions need to take place immediately to populate those arrays.

      // By default, value is as it is.
      bytes = value = this._value;

      // Convert to float or double.
      if (field.type == "f") {
        if (field.bits == 32)
          value = ieee754.fromIEEE754Single(bytes)
        else
          value = ieee754.fromIEEE754Double(bytes)
     

      // Get the two's compliment signed value. 
      } else if (field.signed) {
        value = 0;
        if ((bytes[bytes.length - 1] & 0x80) == 0x80) {
          var top = bytes.length - 1
          for (i = 0; i < top; i++)
            value += (~bytes[i] & 0xff) * Math.pow(256, i)
          // To get the two's compliment as a positive value you use
          // `~1 & 0xff == 254`. For exmaple: `~1 == -2`.
          value += (~(bytes[top] & 0x7f) & 0xff & 0x7f) * Math.pow(256, top);
          value += 1;
          value *= -1;
        } else {
          // Not really necessary, the bit about top.
          top = bytes.length - 1
          for (i = 0; i < top; i++)
            value += (bytes[i] & 0xff)  * Math.pow(256, i);
          value += (bytes[top] & 0x7f) * Math.pow(256, top);
        }
      }
      // If the current field is arrayed, we keep track of the array we're
      // building after a pause through member variable.
      if (field.arrayed) this._arrayed.push(value);
    }

    // If we've not yet hit our terminator, check for the terminator. If we've
    // hit the terminator, and we do not have a maximum size to fill, then
    // terminate by setting up the array to terminate.
    //
    // A length value of the maximum number value means to repeat until the
    // terminator, but a specific length value means that the zero terminated
    // string occupies a field that has a fixed length, so we need to skip the
    // unused bytes.
    if (! this._terminated) {
      if (this._terminator == value) {
        this._terminated = true;
        var terminator = this._pattern[this._patternIndex].terminator;
        for (i = 1, I = terminator.length; i <= I; i++) {
          if (this._arrayed[this._arrayed.length - i] != terminator[terminator.length - i]) {
            this._terminated = false
            break
          }
        }
        if (this._terminated) {
          for (i = 0, I + terminator.length; i < I; i++) {
            this._arrayed.pop();
          }
          this._terminated = true;
          if (this._repeat == Number.MAX_VALUE) {
            this._repeat = this._index + 1;

          } else {
            this._skipping = (this._repeat - (++this._index)) * field.bytes
            if (this._skipping) {
              this._repeat = this._index + 1;
              continue
            }
          }
        }
      }
    }

    // If we are reading an arrayed pattern and we have not read all of the
    // array elements, we repeat the current field type.
    if (++this._index <  this._repeat) {
      this._nextValue();

    // Otherwise, we've got a complete field value, either a JavaScript
    // primitive or raw bytes as an array.
    } else {

      // If we're not skipping, push the field value after running it through
      // the pipeline.
      if (field.endianness != "x") {
        var packing;

        // If the field is a bit packed field, unpack the values and push them
        // onto the field list.
        if (packing = field.packing) {
          var length  = field.bits;
          for (i = 0, I = packing.length; i < I; i++) {
            var pack = packing[i];
            length -= pack.bits;
            if (pack.endianness == "b") {
              var unpacked = Math.floor(value / Math.pow(2, length));
              unpacked = unpacked % Math.pow(2, pack.bits);
              // If signed, we convert from two's compliment.
              if (pack.signed) {
                var mask = Math.pow(2, pack.bits - 1)
                if (unpacked & mask)
                  unpacked = -(~(unpacked - 1) & (mask * 2 - 1))
              }
              this._fields.push(unpacked);
            }
          }
       
        // If the value is a length encoding, we set the repeat value for the
        // subsequent array of values. If we have a zero length encoding, we
        // push an empty array through the pipeline, and move on to the next
        // field.
        } else if (field.lengthEncoding) {
          if ((this._pattern[this._patternIndex + 1].repeat = value) == 0) {
            this._fields.push(this._pipeline(field, [], false))
            this._patternIndex++
          }
        // If the value is used as a switch for an alternation, we run through
        // the different possible branches, updating the pattern with the
        // pattern of the first branch that matches. We then re-read the bytes
        // used to determine the conditional outcome.
        } else if (field.alternation) {
          // This makes no sense now.I wonder if it is called.
          // unless field.signed
          //  value = (Math.pow(256, i) * b for b, i in @_arrayed)
          var i, I, branch;
          for (i = 0, I = field.alternation.length; i < I; i++) {
            branch = field.alternation[i];
            if (branch.read.minimum <= value &&
                value <= branch.read.maximum &&
                (value & branch.read.mask) == branch.read.mask)
              break;
          }
          if (branch.failed)
            throw new Error("Cannot match branch.");
          bytes = this._arrayed.slice(0);
          this._bytesRead -= bytes.length;
          this._pattern.splice.apply(this._pattern, [ this._patternIndex, 1 ].concat(branch.pattern));
          this._nextField()
          this._nextValue()
          this.parse(bytes, 0, bytes.length);
          continue;
        

        // Otherwise, the value is what it is, so run it through the user
        // supplied tranformation pipeline, and push it onto the list of fields.
        } else {
          if (field.arrayed) value = this._arrayed;
          this._fields.push(this._pipeline(field, value, false));
        }
      }
      // If we have read all of the pattern fields, call the associated
      // callback.  We add the parser and the user suppilied additional
      // arguments onto the callback arguments.
      //
      // The pattern is set to null, our terminal condition, because the
      // callback may specify a subsequent packet to parse.
      if (++this._patternIndex == this._pattern.length) {
        var pattern = this._pattern;
        this._pattern = null;

        if (this._callback) {
          // At one point, you thought you could have  a test for the arity of
          // the function, and if it was not `1`, you'd call the callback
          // positionally, regardless of named parameters. Then you realized
          // that the `=>` operator in CoffeeScript would use a bind function
          // with no arguments, and read the argument array. If you do decide to
          // go back to arity override, then greater than one is the trigger.
          // However, on reflection, I don't see that the flexiblity is useful,
          // and I do believe that it will generate at least one bug report that
          // will take a lot of hashing out only to close with "oh, no, you hit
          // upon a "hidden feature".
          var index = 0
          if (this._named) {
            var object = {};
            for (i = 0, I = pattern.length; i < I; i++) {
              field = pattern[i];
              if (field.endianness != "x") {
                if (field.packing) {
                  for (var j = 0, J = field.packing.length; j < J; j++) {
                    pack = field.packing[j];
                    if (pack.endianness != "x") {
                      if (pack.name) {
                        object[pack.name] = this._fields[index]
                      } else {
                        object["field" + (index + 1)] = this._fields[index]
                      }
                      index++;
                    }
                  }
                } else {
                  if (field.name)
                    object[field.name] = this._fields[index];
                  else
                    object["field" + (index + 1)] = this._fields[index];
                  index++;
                }
              }
            }
            this._callback.call(this._context, object);
          } else {
            this._callback.apply(this._context, this._fields);
          }

          // The callback can pause the parser, which causes us to stash the
          // current state of our parser, then return `false` to indicate that
          // the destination is saturated.
          if (this._paused) {
            this._paused = { buffer: buffer, offset: offset, end: end };
            return false
          }
        }
      // Otherwise we proceed to the next field in the packet pattern.
      } else {
        this._nextField()
        this._nextValue()
      }
    }
  }
  // We were able to write the whole
  return true;
}

// Mark the parser as paused and notify the source of the pause.
// TODO Why are these here?
Parser.prototype.pause = function () {
  this._paused = true;
  this.emit("pause");
}

Parser.prototype.resume = function () {
  var paused;
  if (this._paused) {
    paused = this._paused;
    this._paused = false;
    this.emit("resume");
    this.parse(paused.buffer, paused.start, paused.end);
  }
}

// What to do?
Parser.prototype.destroy = function () {}
Parser.prototype.destroySoon = function () {}
  
Parser.prototype.close = function () {
  this.emit("close");
}

Parser.prototype.end = function (string, encoding) {
  if (string) this.write(string, encoding);
  this.emit("end");
}

module.exports.Parser = Parser;
