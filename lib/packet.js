var parse = require("./pattern").parse
  , transforms = require("./transforms")
  , stream = require("stream")
  , util = require("util")
  ;

// Construct a packet that sends events using the given `self` as `this`.
function Packet(context) {
  this._context = context, this._packets = {}, this.fields = [], this._transforms = Object.create(transforms);
  this.reset();
}

// Base class for `Serializer` and `Parser`.
util.inherits(Packet, stream.Stream);

// Create a copy that will adopt the packets defined in this object, through
// prototype inheritence. This is used to efficently create parsers and
// serializers that can run concurrently, from a pre-configured prototype,
// following classic GoF prototype creational pattern.
//
// FIXME Test me.
Packet.prototype.clone = function () {
  var copy;
  copy            = new (this.constructor)();
  copy._packets   = Object.create(this._packets);
  return copy;
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
    

// Resets the bytes read, bytes written and the current pattern. Used to
// recover from exceptional conditions and generally a good idea to call this
// method before starting a new series of packet parsing transitions.
Packet.prototype.reset = function () {
  this._bytesRead = 0;
  this._bytesWritten = 0;
  this._pattern = null;
  this._callback = null;
  this._fields = [];
  this._named = false;
}

// Excute the pipeline of transforms for the `pattern` on the `value`.
Packet.prototype._pipeline = function (pattern, value, reverse) {
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
      parameters.push(! this._outgoing, pattern, value);
      value = this._transforms[transform.name].apply(null, parameters);
      i += by;
    }
  }
  return value;
}

// Setup the next field in the current pattern to read or write.
Packet.prototype._nextValue = function (value) {
  var pattern     = this._pattern[this._patternIndex];
  var little      = pattern.endianness == 'l';
  var bytes       = pattern.bytes;

  this._value     = value;
  this._offset    = little ? 0 : bytes - 1;
  this._increment = little ? 1 : -1;
  this._terminal  = little ? bytes : -1;
}

module.exports = Packet
