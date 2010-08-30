module.exports.create = function () {
  var parse = require('./__internal/pattern').parse;

  function shiftify(arrayish, start, end) {
    var a = [];
    while (start < end) {
      a.push(arrayish[start]);
      start++;
    }
    return a;
  }

  function instance (packets) {
    var machine = null;
    var user = shiftify(arguments, 1, arguments.length);

    function mechanize(definition, index) {
      var little = definition.pattern[index].endianness == 'l';
      var bytes = definition.pattern[index].bytes;
      var machine =
      { value: 0
      , definition: definition
      , index: index
      , offset: little ? 0 : bytes - 1
      , increment: little ? 1 : -1
      , terminal: little ? bytes : -1
      };
      return machine;
    }
    
    function clone () {
      var args = shiftify(arguments, 0, arguments.length);
      args.unshift(Object.create(packets));
      return instance.apply(null, args);
    }

    function noop() {}

    /* Like packet, but no ability to define new named patterns.  */
    function next () {
      var shiftable = shiftify(arguments, 0, arguments.length);
      var nameOrPattern = shiftable.shift();
      if (shiftable.length == 0) {
        machine = mechanize(packets[nameOrPattern], 0);
      } else {
        machine = mechanize(
        { pattern: packets[nameOrPattern] && packets[nameOrPattern].pattern || parse(nameOrPattern)
        , callback: shiftable.shift()
        }, 0);
      }
      packet.apply(this, arguments);
    }

    function packet () {
      var shiftable = shiftify(arguments, 0, arguments.length);
      var nameOrPattern = shiftable.shift();
      if (shiftable.length == 0) {
        machine = mechanize(packets[nameOrPattern], 0);
      } else {
        var patternOrCallback = shiftable.shift();
        if (typeof(patternOrCallback) == 'function') {
          machine = mechanize(
          { pattern: parse(nameOrPattern)
          , callback: patternOrCallback
          }, 0);
        } else {
          packets[name] =
          { pattern: parse(pattern)
          , callback: shiftable.shift() || noop
          };
        }
      }
    }

    function reset() {
      bytesRead = 0;
    }

    var fields = [];
    var bytesRead = 0;
    var engine = 
    { next: next
    , get bytesRead () { return bytesRead }
    };

    function read (buffer) {
      var offset = arguments.length > 1 ? arguments[1] : 0;
      var length = arguments.length > 2 ? arguments[2] : buffer.length;
      while (offset < length) {
        var b = buffer[offset];
        bytesRead++;
        offset++;
        machine.value += Math.pow(256, machine.offset) * b;
        machine.offset += machine.increment;
        if (machine.offset == machine.terminal) {
          fields.push(machine.value)
          if (++machine.index == machine.definition.pattern.length) {
            fields.push(engine);
            for (var i = 0; i < user.length; i++) {
              fields.push(user[i]);
            }
            machine.definition.callback.apply(null, fields);
            machine = null;
            fields.length = 0;
          } else {
            machine = mechanize(machine.definition, machine.index);
          }
        }
      }
    }

    var packet =
    { clone: clone
    , packet: packet
    , reset : reset
    , read: read
    };
    return packet;
  }

  return instance({});
};

/* vim: set ts=2 sw=2 et nowrap: */
