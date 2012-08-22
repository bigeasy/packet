var parse = require('./lib/pattern').parse
  , ieee754   = require('./lib/ieee754')
  , util = require('util')
  , __slice = [].slice
  ;

function objectify () {
  var i, I, name;
  for (i = 0, I = arguments.length; i < I; i++) {
    name = arguments[i].name;
    if (name[0] == "_")
      this.__defineGetter__(name.slice(1), arguments[i]);
    else if (name[name.length - 1] == "_")
      this.__defineSetter__(name.slice(0, name.length - 1), arguments[i]);
    else
      this[arguments[i].name] = arguments[i];
  }
  return this;
}

// The defualt transforms built into Packet.
var transforms =
// Convert the value to and from the given encoding.
{ str: function (encoding, parsing, field, value) {
  var i, I, ascii = /^ascii$/i.test(encoding);
    if (parsing) {
      if (! (value instanceof Buffer)) value = new Buffer(value);
      // Broken and waiting on [297](http://github.com/ry/node/issues/issue/297).
      // If the top bit is set, it is not ASCII, so we zero the value.
      if (ascii) {
        for (i = 0, I = value.length; i < I; i++) {
          if (value[i] & 0x80) value[i] = 0;
        }
        encoding = "utf8"
      }
      var length = value.length;
      return value.toString(encoding, 0, length);
    } else {
      var buffer = new Buffer(value, encoding);
      if (ascii) {
        for (var i = 0, I = buffer.length; i < I; i++) {
          if (value.charAt(i) == '\u0000') buffer[i] = 0;
        }
      }
      return buffer;
    }
  }
// Convert to and from ASCII.
, ascii: function (parsing, field, value) {
    return transforms.str("ascii", parsing, field, value);
  }
// Convert to and from UTF-8.
, utf8: function (parsing, field, value) {
    return transforms.str("utf8", parsing, field, value);
  }
// Add padding to a value before you write it to stream.
, pad: function (character, length, parsing, field, value) {
    if (! parsing) {
      while (value.length < length) value = character + value;
    }
    return value;
  }
// Convert a text value from alphanumeric to integer.
, atoi: function (base, parsing, field, value) {
    return parsing ? parseInt(value, base) : value.toString(base);
  }
// Convert a text value from alphanumeric to float.
, atof: function (parsing, field, value) {
    return parsing ? parseFloat(value) : value.toString();
  }
};

// Construct a packet that sends events using the given `self` as `this`.
function Packet(context) {
  this._context = context, this._packets = {}, this.fields = [], this._transforms = Object.create(transforms);
}

// Map a named packet with the given `name` to the given `pattern`. 
Packet.prototype.packet = function (name, pattern, callback) {
  this._packets[name] = { pattern: parse(pattern), callback: callback || null };
}

// Initialize a named pattern or parse a pattern for parsing or serialization.
// This setup of a new pattern is common to both `Parser` and `Serializer`.
Packet.prototype._nameOrPattern  = function (nameOrPattern, callback) {
  var packet, pattern;
  if (packet = this._packets[nameOrPattern]) {
    pattern    = packet.pattern.slice(0);
    callback   = callback || packet.callback || null;
  } else {
    pattern    = parse(nameOrPattern);
  }

  this._pattern      = pattern;
  this._callback     = callback;
  this._patternIndex = 0;
}
    
// Excute the pipeline of transforms for the `pattern` on the `value`.
function _pipeline (outgoing, pattern, value, reverse) {
  var i, I, j, J, by, pipeline, parameters, transform;
  // Run the piplines for parsing.
  if (pipeline = pattern.pipeline) {
    if (reverse) {
      i = pipeline.length - 1, I = -1, by = -1;
    } else {
      i = 0, I = pipeline.length; by = 1;
    }
    while (i != I) {
      transform = pipeline[i];
      parameters = [];
      for (j = 0, J = transform.parameters.length; j < J; j++) {
        parameters.push(transform.parameters[j])
      }
      parameters.push(outgoing, pattern, value);
      value = transforms[transform.name].apply(null, parameters);
      i += by;
    }
  }
  return value;
}

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
  Packet.call(this, self)

  var increment, _offset, terminal, terminated, terminator, _value, self = this, _bytesRead = 0;

  function _length () { return _bytesRead }

  function reset () { _bytesRead = 0 }

  // Initialize the next field pattern in the serialization pattern array, which
  // is the pattern in the array `@_pattern` at the current `@_patternIndex`.
  function _nextField ()  {
    var pattern       = self._pattern[self._patternIndex];
    self._repeat      = pattern.repeat;
    self._index       = 0;
    self._skipping    = null;
    terminated  = ! pattern.terminator;
    terminator  = pattern.terminator && pattern.terminator[pattern.terminator.length - 1];
    self._named       = self._named || !! pattern.name;
    if (pattern.arrayed && pattern.endianness  != "x") self._arrayed = [];
  }

  // Prepare the parser to parse the next value in the input stream.  It
  // initializes the value to a zero integer value or an array.  This method
  // accounts for skipping, for skipped patterns.
  function _nextValue () {
    // Get the next pattern.
    var pattern = self._pattern[self._patternIndex], value;

    // If skipping, skip over the count of bytes.
    if (pattern.endianness == "x") {
      self._skipping  = pattern.bytes;

    // Create the empty value and call the inherited `@_nextValue`.
    } else {
      _value = pattern.exploded ? [] : 0;
    }
    var little = pattern.endianness == 'l';
    var bytes       = pattern.bytes;
    terminal = little ? bytes : -1;
    _offset = little ? 0 : bytes - 1;
    increment = little ? 1 : -1;
  }

  // Set the next packet to parse by providing a named packet name or a packet
  // pattern, with an optional `callback`. The optional `callback` will override
  // the callback assigned to a named pattern.
  function extract (nameOrPattern, callback) {
    self._nameOrPattern(nameOrPattern, callback);
    self._fields      = [];

    _nextField();
    _nextValue();
  }

  //#### parser.parse(buffer[, offset][, length])
  // The `parse` method reads from the buffer, returning when the current pattern
  // is read, or the end of the buffer is reached.
  //
  // If the stream is paused by a pattern callback, this method will return
  // `false`, to indicate that the parser is no longer capable of accepting data.

  // Read from the `buffer` for the given `offset` `and length`.
  function parse (buffer, offset, length) {
    // Initialize the loop counters. Initialize unspecified parameters with their
    // defaults.
    var offset  = offset || 0
      , length  = length || buffer.length
      , start   = _bytesRead
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
        _bytesRead += advance;
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
            _bytesRead++;
            offset++;
            _value[_offset] = b;
            _offset += increment;
            if (_offset == terminal) break;
            if (offset == end) return true;
          }
        // Otherwise we're packing bytes into an unsigned integer, the most
        // common case.
        } else {
          for (;;) {
            b = buffer[offset];
            _bytesRead++;
            offset++;
            _value += Math.pow(256, _offset) * b
            _offset += increment
            if (_offset == terminal) break;
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
        bytes = value = _value;

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
      if (! terminated) {
        if (terminator == value) {
          terminated = true;
          var t = this._pattern[this._patternIndex].terminator;
          for (i = 1, I = t.length; i <= I; i++) {
            if (this._arrayed[this._arrayed.length - i] != t[t.length - i]) {
              terminated = false
              break
            }
          }
          if (terminated) {
            for (i = 0, I + t.length; i < I; i++) {
              this._arrayed.pop();
            }
            terminated = true;
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
        _nextValue();

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
              this._fields.push(_pipeline(! this._outgoing, field, [], false))
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
            _bytesRead -= bytes.length;
            this._pattern.splice.apply(this._pattern, [ this._patternIndex, 1 ].concat(branch.pattern));
            _nextField()
            _nextValue()
            this.parse(bytes, 0, bytes.length);
            continue;
          

          // Otherwise, the value is what it is, so run it through the user
          // supplied tranformation pipeline, and push it onto the list of fields.
          } else {
            if (field.arrayed) value = this._arrayed;
            this._fields.push(_pipeline(! this._outgoing, field, value, false));
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
          }
        // Otherwise we proceed to the next field in the packet pattern.
        } else {
          _nextField()
          _nextValue()
        }
      }
    }
    // We were able to write the whole
    return true;
  }

  return objectify.call(this, extract, parse, reset, _length);
}

// The `Parser` reads binary data from a stream and converts it into JavaScript
// primitives, Strings and arrays of JavaScript primitives.
util.inherits(Parser, Packet);

module.exports.Parser = Parser;

// Construct a `Serializer` that will use the given `self` object as the `this`
// when a callback is called. If no `self` is provided, the `Serializer`
// instance will be used as the `this` object for serialization event callbacks.
function Serializer(context) {
  Packet.call(this, context);

  var terminal, _offset, increment, _value, _bytesWritten = 0, self = this;

  function _length () { return _bytesWritten }

  function reset () { _bytesWritten = 0 }

  // Initialize the next field pattern in the serialization pattern array, which
  // is the pattern in the array `this._pattern` at the current `this._patternIndex`.
  // This initializes the serializer to write the next field.
  function _nextField () {
    var pattern           = self._pattern[self._patternIndex]
    self._repeat      = pattern.repeat
    self._terminated  = ! pattern.terminator
    self._terminates  = ! self._terminated
    self._index       = 0

    delete        self._padding

    // Can't I keep separate indexes? Do I need that zero?
    if (pattern.endianness ==  "x") {
      self._outgoing.splice(self._patternIndex, 0, null);
      if (pattern.padding != null)
        self._padding = pattern.padding
    }
  }

  // Initialize the next field value to serialize. In the case of an arrayed
  // value, we will use the next value in the array. This method will adjust the
  // pattern for alteration. It will back a bit packed integer. It will covert
  // the field to a byte array for floats and signed negative numbers.
  function _nextValue () {
    var i, I, value, packing;
    var pattern = self._pattern[self._patternIndex];

    // If we are skipping without filling we note the count of bytes to skip.
    if (pattern.endianness ==  "x" &&  self._padding == null) {
      self._skipping = pattern.bytes

    // If the pattern is an alternation, we use the current value to determine
    // with alternate to apply. We then update the pattern array with pattern of
    // the matched alternate, and rerun the next field and next value logic.
    } else if (pattern.alternation) {
      value = self._outgoing[self._patternIndex]
      for (i = 0, I = pattern.alternation.length; i < I; i++) {
        var alternate = pattern.alternation[i];
        if (alternate.write.minimum <= value &&  value <= alternate.write.maximum) {
          self._pattern.splice.apply(self._pattern, [ self._patternIndex, 1 ].concat(alternate.pattern));
          break
        }
      }
      if (alternate.failed)
        throw new Error("Cannot match alternation.");
      _nextField()
      _nextValue()

    // Otherwise, we've got a value to write here and now.
    } else {
      // If we're filling, we write the fill value.
      if (self._padding != null) {
        value = self._padding

      // If the field is arrayed, we get the next value in the array.
      } else if (pattern.arrayed) {
        value = self._outgoing[self._patternIndex][self._index]

      // If the field is bit packed, we update the `self._outgoing` array of values
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
            var unpacked = pack.padding != null ? pack.padding : self._outgoing[self._patternIndex + count++]
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
        self._outgoing.splice(self._patternIndex, count, value);

      // If the current field is a length encoded array, then the length of the
      // the current array value is the next value, otherwise, we have the
      // simple case, the value is the current value.
      } else {
        if (pattern.lengthEncoding) {
          var repeat = self._outgoing[self._patternIndex].length;
          self._outgoing.splice(self._patternIndex, 0, repeat);
          self._pattern[self._patternIndex + 1].repeat = repeat;
        }
        value = self._outgoing[self._patternIndex];
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
      var little = pattern.endianness == 'l';
      var bytes = pattern.bytes;
      terminal = little  ? bytes : -1;
      _offset = little ? 0 : bytes - 1;
      increment = little ? 1 : -1;
      _value = value;
    } 
  }
  //#### serializer.buffer([buffer, ]values...[, callback])

  // Serialize output to a `Buffer` or an `Array`. The first argument is the
  // `Buffer` or `Array` to use. If omitted, the `this._buffer` member of the
  // serializer will be used. The optional `callback` will be invoked using the
  // flexiable `this` object, with the buffer as the sole argument.
  function serialize () {
    var shiftable = __slice.call(arguments);
    var i, I;
    // The pattern is given as a pattern name for a named pattern, or else a spot
    // pattern to parse and use immediately.
    if (typeof shiftable[shiftable.length - 1] == 'function')
      var callback = shiftable.pop()
    var nameOrPattern = shiftable.shift()
    self._nameOrPattern(nameOrPattern, callback);

    if (shiftable.length ==  1 &&
        typeof shiftable[0] ==  "object" &&
        ! (shiftable[0] instanceof Array)) {
      var object = shiftable.shift(), pattern = [];
      self._outgoing = []
      for (i = 0, I = self._pattern.length; i < I; i++) {
        var part = self._pattern[i];
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
                  self._outgoing.push(part.packing[k].name ? object[part.packing[k].name] : null)
                }
              }
            } else {
              if (part.endianness != 'x') {
                self._outgoing.push(part.name ? object[part.name] : null)
              }
            }
          }
        } else {
          pattern.push(part);
          if (part.endianness != 'x') {
            self._outgoing.push(part.name ? object[part.name] : null)
          }
        }
      }
      self._pattern = pattern;
    } else {
      self._outgoing = shiftable
    }

    // Run the outgoing values through field pipelines before we enter the write
    // loop. We need to skip over the blank fields and constants. We also skip
    // over bit packed feilds because we do not apply pipelines to packed fields.
    var skip = 0, j = 0;
    for (i = 0, I = self._outgoing.length; i < I; i++) {
      var value = self._outgoing[i];
      if (skip) {
        skip--
        continue
      }
      if (self._pattern[j].packing) {
        for (var k = 0, K = self._pattern[j].packing.length; k < K; k++) {
          var pack = self._pattern[j].packing[k];
          if (pack.endianness ==  "b") skip++;
        }
        if (skip > 0) skip--;
      } else {
        while (self._pattern[j] &&  self._pattern[j].endianness ==  "x") j++;
        if (! self._pattern[j]) {
          throw new Error("too many fields");
        }
        self._outgoing[i] = _pipeline(! self._outgoing, self._pattern[j], value, true)
      }
      j++;
    }
    _nextField()
    _nextValue()

    return callback;
  }

  //#### serializer.write(buffer[, offset][, length])

  // The `write` method writes to the buffer, returning when the current pattern
  // is written, or the end of the buffer is reached.  Write to the `buffer` in
  // the region defined by the given `offset` and `length`.
  self._serialize = function (buffer, offset, length) {
    var start = offset, end = offset + length;

    // We set the pattern to null when all the fields have been written, so while
    // there is a pattern to fill and space to write.
    while (self._pattern &&  offset < end) {
      if (self._skipping) {
        var advance     = Math.min(self._skipping, end - offset);
        offset         += advance;
        self._skipping      -= advance;
        _bytesWritten  += advance;
        if (self._skipping) return offset - start;

      } else {
        // If the pattern is exploded, the value we're writing is an array.
        if (self._pattern[self._patternIndex].exploded) {
          for (;;) {
            buffer[offset] = _value[_offset];
            _offset += increment;
            _bytesWritten++;
            offset++;
            if (_offset ==  terminal) break;
            if (offset == end) return offset - start;
          }
        // Otherwise we're unpacking bytes of an unsigned integer, the most common
        // case.
        } else {
          for (;;) {
            buffer[offset] = Math.floor(_value / Math.pow(256, _offset)) & 0xff;
            _offset += increment;
            _bytesWritten++;
            offset++;
            if (_offset ==  terminal) break;
            if (offset ==  end) return offset - start;
          }
        }
      }
      // If we have not terminated, check for the termination state change.
      // Termination will change the loop settings.
      if (self._terminates) {
        if (self._terminated) {
          if (self._repeat ==  Number.MAX_VALUE) {
            self._repeat = self._index + 1
          } else if (self._pattern[self._patternIndex].padding != null)  {
            self._padding = self._pattern[self._patternIndex].padding
          } else {
            self._skipping = (self._repeat - (++self._index)) * self._pattern[self._patternIndex].bytes;
            if (self._skipping) {
              self._repeat = self._index + 1;
              continue;
            }
          }
        } else {
          // If we are at the end of the series, then we create an empty outgoing
          // array to hold the terminator, because the outgoing series may be a
          // buffer. We insert the terminator at next index in the outgoing array.
          // We then set repeat to allow one more iteration before callback.
          if (self._outgoing[self._patternIndex].length == self._index + 1) {
            self._terminated = true;
            self._outgoing[self._patternIndex] = [];
            var terminator = self._pattern[self._patternIndex].terminator;
            for (var i = 0, I = terminator.length; i < I; i++) {
              self._outgoing[self._patternIndex][self._index + 1 + i] = terminator[i];
            }
          }
        }
      }
      // If we are reading an arrayed pattern and we have not read all of the
      // array elements, we repeat the current field type.
      if (++self._index < self._repeat) {
        _nextValue();

      // If we have written all of the packet fields, call the associated
      // callback with self parser.
      //
      // The pattern is set to null, our terminal condition, before the callback,
      // because the callback may specify a subsequent packet to parse.
      } else if (++self._patternIndex ==  self._pattern.length) {
        self._pattern = null

        if (self._callback != null)
          self._callback.call(self._self, self);

      } else {

        delete        self._padding;
        this._repeat      = self._pattern[self._patternIndex].repeat;
        self._terminated  = ! self._pattern[self._patternIndex].terminator;
        self._terminates  = ! self._terminated;
        self._index       = 0;

        _nextField();
        _nextValue();
      }
    }
    self._outgoing = null;

    return offset - start;
  }

  function write (buffer) {
    this._serialize(buffer, 0, buffer.length);
  }

  objectify.call(this, serialize, write, reset, _length);
}
// The `Serializer` writes JavaScript primitives to a stream in binary
// representations.
util.inherits(Serializer, Packet);

module.exports.Serializer = Serializer;
