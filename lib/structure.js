Parser      = require("./parser");
Serializer  = require("./serializer");

function Structure(pattern) {
  this.parser = new Parser()
  this.parser.packet("structure", pattern);
  this.serializer = new Serializer()
  this.serializer.packet("structure", pattern)
}

// TODO Varargs to size a structure.
Structure.prototype.sizeOf = function () {
  var values = __slice.call(arguments, 0);
  return 0;
}

Structure.prototype.read = function (buffer, offset, callback) {
  if (typeof offset == "function" && ! callback) callback = offset;
  this.parser.reset();
  this.parser.parse("structure", callback);
  this.parser.read(buffer, offset, Number.MAX_VALUE);
}

var __slice = [].slice;
Structure.prototype.write = function () {
  var values = __slice.call(arguments, 0);
  buffer = values.shift();
}
