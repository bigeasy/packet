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
 
function die () {
  console.log.apply(console, [].slice.call(arguments, 0));
  return process.exit(1);
}

function say () { return console.log.apply(console, [].slice.call(arguments, 0)) }

// The `Definition` class is contianed by the `Serializer` and parser. We expose
// public methods by explicitly adding the methods to the `Serializer` or
// `Parser` when we create them. The `Definition` class references only enclosed
// variables, but it does use prototypal inheritance to extend the collections
// of packet patterns and transforms.

function Definition (context, packets, transforms) {
  packets = Object.create(packets);
  transforms = Object.create(transforms);

  function packet (name, pattern) {
    packets[name] = parse(pattern);
  }

  function transform (name, procedure) {
    transforms[name] = procedure;
  }

  function pattern (nameOrPattern) {
    return packets[nameOrPattern] || parse(nameOrPattern);
  }

  function createParser (context) {
    return new Parser(new Definition(context, packets, transforms));
  }

  function createSerializer (context) {
    return new Serializer(new Definition(context, packets, transforms));
  }

  function extend (object) {
    return objectify.call(object, packet, transform, createParser, createSerializer);
  }

  // Execute the pipeline of transforms for the `pattern` on the `value`.
  function pipeline (outgoing, pattern, value, reverse) {
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

  this.context = context;

  return objectify.call(this, packet, transform, pattern, pipeline, extend);
}


//#### Parser

// Construct a `Parser` around the given `definition`.
function Parser (definition) {
  var increment, _offset, terminal, terminated, terminator, _value, self = this,
  _bytesRead = 0, _skipping, repeat, step, _outgoing, _named, _index, _arrayed,
  _pattern, _patternIndex, _context = definition.context || this, _fields, _callback;

  // The length property of the `Parser`, returning the number of bytes read.
  function _length () { return _bytesRead }

  // The public `reset` method to reuse the parser, clearing the current state.
  function reset () { _bytesRead = 0 }

  // Initialize the next field pattern in the serialization pattern array, which
  // is the pattern in the array `@_pattern` at the current `@_patternIndex`.
  function _nextField ()  {
    var pattern       = _pattern[_patternIndex];
    repeat      = pattern.repeat;
    _index       = 0;
    _skipping    = null;
    terminated  = ! pattern.terminator;
    terminator  = pattern.terminator && pattern.terminator[pattern.terminator.length - 1];
    _named       = _named || !! pattern.name;
    if (pattern.arrayed && pattern.endianness  != "x") _arrayed = [];
  }

  // Prepare the parser to parse the next value in the input stream.  It
  // initializes the value to a zero integer value or an array.  This method
  // accounts for skipping, for skipped patterns.
  function _nextValue () {
    // Get the next pattern.
    var pattern = _pattern[_patternIndex], value;

    // If skipping, skip over the count of bytes.
    if (pattern.endianness == "x") {
      _skipping  = pattern.bytes;

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

  // Sets the next packet to extract from the stream by providing a named packet
  // name as defined by `packet` or else a packet pattern to parse. The
  // `callback` will be invoked when the packet has been extracted from the
  // stream or buffer.

  //
  function extract (nameOrPattern, callback) {
    _pattern = definition.pattern(nameOrPattern);
    _patternIndex = 0;
    _callback = callback;
    _fields = [];

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
    while (_pattern != null && offset < end) {
      field = _pattern[_patternIndex];
      // If we are skipping, we advance over all the skipped bytes or to the end
      // of the current buffer.
      if (_skipping != null) {
        var advance  = Math.min(_skipping, end - offset);
        var begin    = offset;
        offset      += advance;
        _skipping  -= advance;
        _bytesRead += advance;
        // If we have more bytes to skip, then return `true` because we've
        // consumed the entire buffer.
        if (_skipping)
          return true
        else
          _skipping = null

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
        if (field.arrayed) _arrayed.push(value);
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
          var t = _pattern[_patternIndex].terminator;
          for (i = 1, I = t.length; i <= I; i++) {
            if (_arrayed[_arrayed.length - i] != t[t.length - i]) {
              terminated = false
              break
            }
          }
          if (terminated) {
            for (i = 0, I + t.length; i < I; i++) {
              _arrayed.pop();
            }
            terminated = true;
            if (repeat == Number.MAX_VALUE) {
              repeat = _index + 1;
            } else {
              _skipping = (repeat - (++_index)) * field.bytes
              if (_skipping) {
                repeat = _index + 1;
                continue
              }
            }
          }
        }
      }

      // If we are reading an arrayed pattern and we have not read all of the
      // array elements, we repeat the current field type.
      if (++_index <  repeat) {
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
                _fields.push(unpacked);
              }
            }
         
          // If the value is a length encoding, we set the repeat value for the
          // subsequent array of values. If we have a zero length encoding, we
          // push an empty array through the pipeline, and move on to the next
          // field.
          } else if (field.lengthEncoding) {
            if ((_pattern[_patternIndex + 1].repeat = value) == 0) {
              _fields.push(definition.pipeline(! _outgoing, field, [], false))
              _patternIndex++
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
            bytes = _arrayed.slice(0);
            _bytesRead -= bytes.length;
            _pattern = _pattern.slice(0);
            _pattern.splice.apply(_pattern, [ _patternIndex, 1 ].concat(branch.pattern));
            _nextField()
            _nextValue()
            parse(bytes, 0, bytes.length);
            continue;
          

          // Otherwise, the value is what it is, so run it through the user
          // supplied transformation pipeline, and push it onto the list of
          // fields.
          } else {
            if (field.arrayed) value = _arrayed;
            _fields.push(definition.pipeline(! _outgoing, field, value, false));
          }
        }
        // If we have read all of the pattern fields, call the associated
        // callback.  We add the parser and the user suppilied additional
        // arguments onto the callback arguments.
        //
        // The pattern is set to null, our terminal condition, because the
        // callback may specify a subsequent packet to parse.
        if (++_patternIndex == _pattern.length) {
          var pattern = _pattern;
          _pattern = null;

          if (_callback) {
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
            if (_named) {
              var object = {};
              for (i = 0, I = pattern.length; i < I; i++) {
                field = pattern[i];
                if (field.endianness != "x") {
                  if (field.packing) {
                    for (var j = 0, J = field.packing.length; j < J; j++) {
                      pack = field.packing[j];
                      if (pack.endianness != "x") {
                        if (pack.name) {
                          object[pack.name] = _fields[index]
                        } else {
                          object["field" + (index + 1)] = _fields[index]
                        }
                        index++;
                      }
                    }
                  } else {
                    if (field.name)
                      object[field.name] = _fields[index];
                    else
                      object["field" + (index + 1)] = _fields[index];
                    index++;
                  }
                }
              }
              _callback.call(_context, object);
            } else {
              _callback.apply(_context, _fields);
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

  return objectify.call(definition.extend(this), extract, parse, reset, _length);
}

module.exports.Parser = Parser;

// Construct a `Serializer` that will use the given `self` object as the `this`
// when a callback is called. If no `self` is provided, the `Serializer`
// instance will be used as the `this` object for serialization event callbacks.
function Serializer(definition) {
  var terminal, _offset, increment, _value, _bytesWritten = 0, self = this,
  _skipping, repeat, _outgoing, _index, _terminated, _terminates, _pattern,
  _patternIndex, _context = definition.context || this, _padding, _callback;

  function _length () { return _bytesWritten }

  function reset () { _bytesWritten = 0 }

  // Initialize the next field pattern in the serialization pattern array, which
  // is the pattern in the array `_pattern` at the current `_patternIndex`.
  // This initializes the serializer to write the next field.
  function _nextField () {
    var pattern           = _pattern[_patternIndex]
    repeat      = pattern.repeat
    _terminated  = ! pattern.terminator
    _terminates  = ! _terminated
    _index       = 0
    _padding = null;

    // Can't I keep separate indexes? Do I need that zero?
    if (pattern.endianness ==  "x") {
      _outgoing.splice(_patternIndex, 0, null);
      if (pattern.padding != null)
        _padding = pattern.padding
    }
  }

  // Initialize the next field value to serialize. In the case of an arrayed
  // value, we will use the next value in the array. This method will adjust the
  // pattern for alteration. It will back a bit packed integer. It will covert
  // the field to a byte array for floats and signed negative numbers.
  function _nextValue () {
    var i, I, value, packing, count, length, pack, unpacked, range, mask;
    var pattern = _pattern[_patternIndex];

    // If we are skipping without filling we note the count of bytes to skip,
    // otherwise we prepare our value.
    if (pattern.endianness ==  "x" &&  _padding == null) {
      _skipping = pattern.bytes
    } else {
      // If we're filling, we write the fill value.
      if (_padding != null) {
        value = _padding;

      // If the field is arrayed, we get the next value in the array.
      } else if (pattern.arrayed) {
        value = _outgoing[_patternIndex][_index];

      // If the field is bit packed, we update the `_outgoing` array of values
      // by packing zero, one or more values into a single value. We will also
      // check for bits filled with a pattern specified filler value and pack
      // that in there as well.
      } else if (packing = pattern.packing) {
        count = 0, value = 0, length = pattern.bits;
        for (i = 0, I = packing.length; i < I; i++) {
          pack = packing[i];
          length -= pack.bits;
          if (pack.endianness ==  "b" || pack.padding != null) {
            unpacked = pack.padding != null ? pack.padding : _outgoing[_patternIndex + count++]
            if (pack.signed) {
              range = Math.pow(2, pack.bits - 1)
              if (!( (-range) <= unpacked &&  unpacked <= range - 1))
                throw new Error("value " + unpacked + " will not fit in " + pack.bits + " bits");
              if (unpacked < 0) {
                mask = range * 2 - 1
                unpacked = (~(- unpacked) + 1) & mask
              }
            }
            value += unpacked * Math.pow(2, length)
          }
        }
        _outgoing.splice(_patternIndex, count, value);

      // If the current field is a length encoded array, then the length of the
      // the current array value is the next value, otherwise, we have the
      // simple case, the value is the current value.
      } else {
        if (pattern.lengthEncoding) {
          var repeat = _outgoing[_patternIndex].length;
          _outgoing.splice(_patternIndex, 0, repeat);
          _pattern[_patternIndex + 1].repeat = repeat;
        }
        value = _outgoing[_patternIndex];
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

  function serialize () {
    var shiftable = __slice.call(arguments)
      , pattern = definition.pattern(shiftable.shift()).slice(0)
      , callback = typeof shiftable[shiftable.length - 1] == 'function' ? shiftable.pop() : void(0)
      , named = (shiftable.length ==  1
              && typeof shiftable[0] ==  "object"
              && ! (shiftable[0] instanceof Array))
      , incoming = named ? shiftable.shift() : shiftable
      , skip = 0, part, value
      , alternate, i, I, j, J, k, K
      ;

    _patternIndex = 0;


    _outgoing = [], _pattern = [];

    // Determine alternation now, creating a pattern with the alternation
    // resolved.

    for (i = 0; i < pattern.length; i++) {
      part = pattern[i];
      // The name of value to test for alternation is either the first name in
      // the alternation or else if the first value is bit packed, the first
      // name in the packed pattern.
      if (part.alternation) {
        part = part.alternation[0];
        if (part.pattern[0].packing) {
          part = part.pattern[0].packing[0];
        }
        value = named ? incoming[part.name] : incoming[0];
        
        part = pattern[i];
        for (j = 0, J = part.alternation.length; j < J; j++) {
          alternate = part.alternation[j];
          if (alternate.write.minimum <= value &&  value <= alternate.write.maximum) {
            break;
          }
        }

        pattern.splice.apply(pattern, [ i--, 1 ].concat(alternate.pattern));
        continue;
      }

      _pattern.push(part);

      if (part.packing) {
        for (j = 0, J = part.packing.length; j < J; j++) {
          if (part.packing[j].endianness != 'x') {
            _outgoing.push(named ? incoming[part.packing[j].name] : incoming.shift());
          }
        }
      } else {
        if (part.endianness != 'x') {
          _outgoing.push(named ? incoming[part.name] : incoming.shift());
        }
      }
    }

    // Run the outgoing values through field pipelines before we enter the write
    // loop. We need to skip over the blank fields and constants. We also skip
    // over bit packed feilds because we do not apply pipelines to packed fields.
    for (j = 0, i = 0, I = _outgoing.length; i < I; i++) {
      value = _outgoing[i];
      if (skip) {
        skip--
        continue
      }
      if (_pattern[j].packing) {
        for (k = 0, K = _pattern[j].packing.length; k < K; k++) {
          if (_pattern[j].packing[k].endianness ==  "b") skip++;
        }
        if (skip > 0) skip--;
      } else {
        while (_pattern[j] &&  _pattern[j].endianness ==  "x") j++;
        if (! _pattern[j]) throw new Error("too many fields");
        _outgoing[i] = definition.pipeline(! _outgoing, _pattern[j], value, true)
      }
      j++;
    }

    _nextField()
    _nextValue()
  }

  //#### serializer.write(buffer[, offset][, length])

  // The `write` method writes to the buffer, returning when the current pattern
  // is written, or the end of the buffer is reached.  Write to the `buffer` in
  // the region defined by the given `offset` and `length`.
  function _serialize (buffer, offset, length) {
    var start = offset, end = offset + length;

    // We set the pattern to null when all the fields have been written, so while
    // there is a pattern to fill and space to write.
    while (_pattern &&  offset < end) {
      if (_skipping) {
        var advance     = Math.min(_skipping, end - offset);
        offset         += advance;
        _skipping      -= advance;
        _bytesWritten  += advance;
        if (_skipping) return offset - start;

      } else {
        // If the pattern is exploded, the value we're writing is an array.
        if (_pattern[_patternIndex].exploded) {
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
      if (_terminates) {
        if (_terminated) {
          if (repeat ==  Number.MAX_VALUE) {
            repeat = _index + 1
          } else if (_pattern[_patternIndex].padding != null)  {
            _padding = _pattern[_patternIndex].padding
          } else {
            _skipping = (repeat - (++_index)) * _pattern[_patternIndex].bytes;
            if (_skipping) {
              repeat = _index + 1;
              continue;
            }
          }
        } else {
          // If we are at the end of the series, then we create an empty outgoing
          // array to hold the terminator, because the outgoing series may be a
          // buffer. We insert the terminator at next index in the outgoing array.
          // We then set repeat to allow one more iteration before callback.
          if (_outgoing[_patternIndex].length == _index + 1) {
            _terminated = true;
            _outgoing[_patternIndex] = [];
            var terminator = _pattern[_patternIndex].terminator;
            for (var i = 0, I = terminator.length; i < I; i++) {
              _outgoing[_patternIndex][_index + 1 + i] = terminator[i];
            }
          }
        }
      }
      // If we are reading an arrayed pattern and we have not read all of the
      // array elements, we repeat the current field type.
      if (++_index < repeat) {
        _nextValue();

      // If we have written all of the packet fields, call the associated
      // callback with self parser.
      //
      // The pattern is set to null, our terminal condition, before the callback,
      // because the callback may specify a subsequent packet to parse.
      } else if (++_patternIndex ==  _pattern.length) {
        _pattern = null

        if (_callback != null)
          _callback.call(_context, self);

      } else {

        _padding = null;
        repeat      = _pattern[_patternIndex].repeat;
        _terminated  = ! _pattern[_patternIndex].terminator;
        _terminates  = ! _terminated;
        _index       = 0;

        _nextField();
        _nextValue();
      }
    }
    _outgoing = null;

    return offset - start;
  }

  function write (buffer) {
    _serialize(buffer, 0, buffer.length);
  }

  objectify.call(definition.extend(this), serialize, write, reset, _length);
}

function createParser (context) { return new Parser(new Definition(context, {}, transforms)) }
function createSerializer (context) { return new Serializer(new Definition(context, {}, transforms)) }

objectify.call(exports, createParser, createSerializer);
