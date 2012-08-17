// Require the necessary Packet sibling modules.
var parse   = require("./pattern")
  , ieee754   = require("./ieee754")
  , Packet  = require("./packet")
  , util = require("util")
  ;

var __slice = [].slice;

function die () {
  console.log.apply(console, __slice.call(arguments, 0));
  return process.exit(1);
}

function say () { return console.log.apply(console, __slice.call(arguments, 0)) }

// Construct a `Serializer` that will use the given `self` object as the `this`
// when a callback is called. If no `self` is provided, the `Serializer`
// instance will be used as the `this` object for serialization event callbacks.
function Serializer(context) {
  Packet.call(this, context);
  this.readable = true;
  this._buffer = new Buffer(1024);
  this._streaming = false;
}
// The `Serializer` writes JavaScript primitives to a stream in binary
// representations.
util.inherits(Serializer, Packet);

// Get the number of bytes written since the last call to `this.reset()`.
Object.defineProperty(Serializer.prototype, 'written', {
  get: function () { return this._bytesWritten }
});

// Initialize the next field pattern in the serialization pattern array, which
// is the pattern in the array `this._pattern` at the current `this._patternIndex`.
// This initializes the serializer to write the next field.
Serializer.prototype._nextField = function () {
  var pattern           = this._pattern[this._patternIndex]
  this._repeat      = pattern.repeat
  this._terminated  = ! pattern.terminator
  this._terminates  = ! this._terminated
  this._index       = 0

  delete        this._padding

  // Can't I keep separate indexes? Do I need that zero?
  if (pattern.endianness ==  "x") {
    this._outgoing.splice(this._patternIndex, 0, null);
    if (pattern.padding != null)
      this._padding = pattern.padding
  }
}

// Initialize the next field value to serialize. In the case of an arrayed
// value, we will use the next value in the array. This method will adjust the
// pattern for alteration. It will back a bit packed integer. It will covert
// the field to a byte array for floats and signed negative numbers.
Serializer.prototype._nextValue = function () {
  var i, I, value, packing;
  var pattern = this._pattern[this._patternIndex];

  // If we are skipping without filling we note the count of bytes to skip.
  if (pattern.endianness ==  "x" &&  this._padding == null) {
    this._skipping = pattern.bytes

  // If the pattern is an alternation, we use the current value to determine
  // with alternate to apply. We then update the pattern array with pattern of
  // the matched alternate, and rerun the next field and next value logic.
  } else if (pattern.alternation) {
    value = this._outgoing[this._patternIndex]
    for (i = 0, I = pattern.alternation.length; i < I; i++) {
      var alternate = pattern.alternation[i];
      if (alternate.write.minimum <= value &&  value <= alternate.write.maximum) {
        this._pattern.splice.apply(this._pattern, [ this._patternIndex, 1 ].concat(alternate.pattern));
        break
      }
    }
    if (alternate.failed)
      throw new Error("Cannot match alternation.");
    this._nextField()
    this._nextValue()

  // Otherwise, we've got a value to write here and now.
  } else {
    // If we're filling, we write the fill value.
    if (this._padding != null) {
      value = this._padding

    // If the field is arrayed, we get the next value in the array.
    } else if (pattern.arrayed) {
      value = this._outgoing[this._patternIndex][this._index]

    // If the field is bit packed, we update the `this._outgoing` array of values
    // by packing zero, one or more values into a single value. We will also
    // check for bits filled with a pattern specified filler value and pack
    // that in there as well.
    } else if (packing = pattern.packing) {
      var count   = 0;
      value   = 0;
      var length  = pattern.bits;
      for (i = 0, I = packing.length; i < I; i++) {
        var pack = packing[i];
        length -= pack.bits;
        if (pack.endianness ==  "b" || pack.padding != null) {
          var unpacked = pack.padding != null ? pack.padding : this._outgoing[this._patternIndex + count++]
          if (pack.signed) {
            var range = Math.pow(2, pack.bits - 1)
            if (!( (-range) <= unpacked &&  unpacked <= range - 1))
              throw new Error("value " + unpacked + " will not fit in " + pack.bits + " bits");
            if (unpacked < 0) {
              var mask = range * 2 - 1
              unpacked = (~(- unpacked) + 1) & mask
            }
          }
          value += unpacked * Math.pow(2, length)
        }
      }
      this._outgoing.splice(this._patternIndex, count, value);

    // If the current field is a length encoded array, then the length of the
    // the current array value is the next value, otherwise, we have the
    // simple case, the value is the current value.
    } else {
      if (pattern.lengthEncoding) {
        var repeat = this._outgoing[this._patternIndex].length;
        this._outgoing.splice(this._patternIndex, 0, repeat);
        this._pattern[this._patternIndex + 1].repeat = repeat;
      }
      value = this._outgoing[this._patternIndex];
    }
    // If the array is not an unsigned integer, we might have to convert it.
    if (pattern.exploded) {
      // Convert a float into its IEEE 754 representation.
      if (pattern.type == "f") {
        if (pattern.bits == 32)
          value = ieee754.toIEEE754Single(value)
        else
          value = ieee754.toIEEE754Double(value)
      
      // Convert a signed integer into its two's complient representation.
      } else if (pattern.signed) {
        var copy = Math.abs(value);
        var bytes = [];
        // FIXME If the value is greater than zero, we can just change the
        // pattern to packed.
        for (i = 0, I = pattern.bytes; i < I; i++) {
          var pow = Math.pow(256, i)
          bytes[i] = Math.floor(copy / pow % (pow * 256))
        }
        if (value < 0) {
          var carry = 1;
          for (i = 0, I = bytes.length; i < I; i++) {
            bytes[i] = (~bytes[i] & 0xff) + carry;
            if (bytes[i] ==  256) bytes[i] = 0;
            else carry = 0;
          }
        }
        value = bytes;
      }
    }
    Packet.prototype._nextValue.call(this, value);
  } 
}
// Create a `WritableStream` to write the bytes directly to the output stream.
// The `WritableStream.write` method must be invoked with exactly `length`
// bytes. FIXME You really can change the meaning of `end` to skip the last
// part, just use skip.
Serializer.prototype.stream = function (length) {
  this._stream = new (require("./writable").WritableStream)(length, this)
}

//### pipe(destination, options)

// An implementation of `Stream.pipe` that can use an `Array` or `Buffer` as a
// destination. If the destination is another `Stream`, then the inherited
// implementation of `Stream.pipe` is invoked after initialization, otherwise,
// the pipe logic in `Stream` is non-applicable.
Serializer.prototype.pipe = function (destination, options) {
  if (destination instanceof Array) {
    this._buffer = destination;
    this._bufferLength = Number.MAX_VALUE;
    this._streaming = false;
  } else if (destination instanceof Buffer) {
    this._buffer = destination;
    this._bufferLength = destination.length;
    this._streaming = false;
  } else {
    this._buffer = (this._ownBuffer = this._ownBuffer || new Buffer(1024));
    this._bufferLength = this._ownBuffer.length;
    this._streaming = true;
    Packet.pipe.call(this, destination, options);
  }
}
// Skip a region of the given `length` in the output stream, filling it with
// the given `fill` byte.
Serializer.prototype.skip = function (length, fill) {
  while (length) {
    size = Math.min(length, this._buffer.length);
    length -= size;
    for (var i = 0; i < size; i++) {
      this._buffer[i] = fill
    }
    this.write(this._buffer.slice(0, size));
  }
}

//#### serializer.buffer([buffer, ]values...[, callback])

// Serialize output to a `Buffer` or an `Array`. The first argument is the
// `Buffer` or `Array` to use. If omitted, the `this._buffer` member of the
// serializer will be used. The optional `callback` will be invoked using the
// flexiable `this` object, with the buffer as the sole argument.
Serializer.prototype.buffer = function () {
  var shiftable = __slice.call(arguments, 0);
  if (Array.isArray(shiftable[0])) {
    var buffer = shiftable.shift();
    var bufferLength = Number.MAX_VALUE;
    var ownsBuffer = false;
  } else if (Buffer.isBuffer(shiftable[0])) {
    var buffer = shiftable.shift();
    var bufferLength = buffer.length;
    var ownsBuffer = false;
  } else {
    var buffer = this._buffer;
    var bufferLength = this._buffer.length;
    var ownsBuffer = true;
  }
  var callback = this._reset(shiftable);
  this._callback = null;

  var read = 0;
  while (this._pattern) {
    if (read == bufferLength) {
      if (ownsBuffer) {
        expanded = new Buffer(buffer.length * 2);
        buffer.copy(expanded);
        buffer = expanded;
      } else {
        this.emit("error", new Error("buffer overflow"));
        return;
      }
    }
    read += this._serialize(buffer, read, bufferLength - read);
  }

  if (ownsBuffer) this._buffer = buffer;

  if (callback != null) {
    callback.call(this._context, buffer.slice(0, read));
  }
}

// Using the airity of the callback might be too clever, when we could simply
// choose a name, such as `serialize` versus `buffer`, or maybe `write` versus
// `buffer`, where write writes the buffer when it fills, and buffer gathers
// everthing in a buffer, and gives the user an opportunity to make last minute
// changes before writing to the stream.
//
// Already have plenty of magic with named versus positional arguments.
Serializer.prototype.write = function () {
  var shiftable = __slice.call(arguments, 0);
  if (Array.isArray(shiftable[0]))
    shiftable[0] = new Buffer(shiftable[0]);
  if (Buffer.isBuffer(shiftable[0])) {
    var slice = shiftable.shift()
    if (this._decoder) {
      string = this._decoder.write(slice)
      this.emit("data", string.length ? string : null);
    } else {
      this.emit("data", slice);
    }
  } else {
    var callback = this._reset(shiftable);
    // Implementing pause requires callbacks.
    this._callback = null
    while (this._pattern) {
      var read = this._serialize(this._buffer, 0, this._buffer.length)
      this.write(this._buffer.slice(0, read));
    }
    callback.call(this._context);
  }
}

//#### serializer._reset(nameOrPattern, values...[, callback])

// Resets the `Seriailzer` to write fields to stream or to buffer using the
// given compiled pattern name or uncompiled pattern.
//
// FIXME: We've already used `reset`, so we need to rename this.
Serializer.prototype._reset = function (shiftable) {
  var i, I;
  // The pattern is given as a pattern name for a named pattern, or else a spot
  // pattern to parse and use immediately.
  if (typeof shiftable[shiftable.length - 1] == 'function')
    var callback = shiftable.pop()
  var nameOrPattern = shiftable.shift()
  this._nameOrPattern(nameOrPattern, callback);

  if (shiftable.length ==  1 &&
      typeof shiftable[0] ==  "object" &&
      ! (shiftable[0] instanceof Array)) {
    var object = shiftable.shift(), pattern = [];
    this._outgoing = []
    for (i = 0, I = this._pattern.length; i < I; i++) {
      var part = this._pattern[i];
      if (part.alternation) {
        for (var j = 0, J = part.alternation.length; j < J; j++) {
          var alternate = part.alternation[j], value;
          if (alternate.pattern[0].packing) {
            value = object[alternate.pattern[0].packing[0].name];
          } else {
            value = object[alternate.pattern[0].name];
          }
          if (alternate.write.minimum <= value &&  value <= alternate.write.maximum) {
            break;
          }
        }
        // Not pretty, plus the check for packed is not present in the
        // non-alternation branch.
        for (var j = 0, J = alternate.pattern.length; j < J; j++) {
          part = alternate.pattern[j];
          pattern.push(part);
          if (part.packing) {
            for (var k = 0, K = part.packing.length; k < K; k++) {
              if (part.packing[k].endianness != 'x') {
                this._outgoing.push(part.packing[k].name ? object[part.packing[k].name] : null)
              }
            }
          } else {
            if (part.endianness != 'x') {
              this._outgoing.push(part.name ? object[part.name] : null)
            }
          }
        }
      } else {
        pattern.push(part);
        if (part.endianness != 'x') {
          this._outgoing.push(part.name ? object[part.name] : null)
        }
      }
    }
    this._pattern = pattern;
  } else {
    this._outgoing = shiftable
  }

  // Run the outgoing values through field pipelines before we enter the write
  // loop. We need to skip over the blank fields and constants. We also skip
  // over bit packed feilds because we do not apply pipelines to packed fields.
  var skip = 0, j = 0;
  for (i = 0, I = this._outgoing.length; i < I; i++) {
    var value = this._outgoing[i];
    if (skip) {
      skip--
      continue
    }
    if (this._pattern[j].packing) {
      for (var k = 0, K = this._pattern[j].packing.length; k < K; k++) {
        var pack = this._pattern[j].packing[k];
        if (pack.endianness ==  "b") skip++;
      }
      if (skip > 0) skip--;
    } else {
      while (this._pattern[j] &&  this._pattern[j].endianness ==  "x") j++;
      if (! this._pattern[j]) {
        throw new Error("too many fields");
      }
      this._outgoing[i] = this._pipeline(this._pattern[j], value, true)
    }
    j++;
  }
  this._nextField()
  this._nextValue()

  return callback;
}
//#### serializer.close()

// Close the underlying output stream.
Serializer.prototype.close = function () {
  this.emit("end")
}

//#### serializer.write(buffer[, offset][, length])

// The `write` method writes to the buffer, returning when the current pattern
// is written, or the end of the buffer is reached.  Write to the `buffer` in
// the region defined by the given `offset` and `length`.
Serializer.prototype._serialize = function (buffer, offset, length) {
  var start = offset, end = offset + length;

  // We set the pattern to null when all the fields have been written, so while
  // there is a pattern to fill and space to write.
  while (this._pattern &&  offset < end) {
    if (this._skipping) {
      var advance     = Math.min(this._skipping, end - offset);
      offset         += advance;
      this._skipping      -= advance;
      this._bytesWritten  += advance;
      if (this._skipping) return offset - start;

    } else {
      // If the pattern is exploded, the value we're writing is an array.
      if (this._pattern[this._patternIndex].exploded) {
        for (;;) {
          buffer[offset] = this._value[this._offset];
          this._offset += this._increment;
          this._bytesWritten++;
          offset++;
          if (this._offset ==  this._terminal) break;
          if (offset == end) return offset - start;
        }
      // Otherwise we're unpacking bytes of an unsigned integer, the most common
      // case.
      } else {
        for (;;) {
          buffer[offset] = Math.floor(this._value / Math.pow(256, this._offset)) & 0xff;
          this._offset += this._increment;
          this._bytesWritten++;
          offset++;
          if (this._offset ==  this._terminal) break;
          if (offset ==  end) return offset - start;
        }
      }
    }
    // If we have not terminated, check for the termination state change.
    // Termination will change the loop settings.
    if (this._terminates) {
      if (this._terminated) {
        if (this._repeat ==  Number.MAX_VALUE) {
          this._repeat = this._index + 1
        } else if (this._pattern[this._patternIndex].padding != null)  {
          this._padding = this._pattern[this._patternIndex].padding
        } else {
          this._skipping = (this._repeat - (++this._index)) * this._pattern[this._patternIndex].bytes;
          if (this._skipping) {
            this._repeat = this._index + 1;
            continue;
          }
        }
      } else {
        // If we are at the end of the series, then we create an empty outgoing
        // array to hold the terminator, because the outgoing series may be a
        // buffer. We insert the terminator at next index in the outgoing array.
        // We then set repeat to allow one more iteration before callback.
        if (this._outgoing[this._patternIndex].length == this._index + 1) {
          this._terminated = true;
          this._outgoing[this._patternIndex] = [];
          var terminator = this._pattern[this._patternIndex].terminator;
          for (var i = 0, I = terminator.length; i < I; i++) {
            this._outgoing[this._patternIndex][this._index + 1 + i] = terminator[i];
          }
        }
      }
    }
    // If we are reading an arrayed pattern and we have not read all of the
    // array elements, we repeat the current field type.
    if (++this._index < this._repeat) {
      this._nextValue()

    // If we have written all of the packet fields, call the associated
    // callback with this parser.
    //
    // The pattern is set to null, our terminal condition, before the callback,
    // because the callback may specify a subsequent packet to parse.
    } else if (++this._patternIndex ==  this._pattern.length) {
      this._pattern = null

      if (this._callback != null)
        this._callback.call(this._self, this);

    } else {

      delete        this._padding;
      this._repeat      = this._pattern[this._patternIndex].repeat;
      this._terminated  = ! this._pattern[this._patternIndex].terminator;
      this._terminates  = ! this._terminated;
      this._index       = 0;

      this._nextField();
      this._nextValue();
    }
  }
  this._outgoing = null;

  return offset - start;
}

module.exports.Serializer = Serializer;
