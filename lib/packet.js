module.exports.create = function () {
  var parse = require('./__internal/pattern').parse;
  var ieee754 = require('./__internal/ieee754');

  function shiftify(arrayish, start, end) {
    var a = [];
    while (start < end) a.push(arrayish[start++]);
    return a;
  }

  function hex (bytes) {
    return bytes.map(function (b) { return b < 10 ? "0" + b.toString(16) : b.toString(16); }).join("");
  }

  function pack (pattern, value) {
    if (pattern.type == "f") {
      return pattern.bits == 32 ? ieee754.toIEEE754Single(value)
                                : ieee754.toIEEE754Double(value);
    }
    return value;
  }

  function unpack (bytes, pattern) {
    if (pattern.type == "h") {
      return hex(bytes.reverse());
    } else if (pattern.type == "f") {
      return pattern.bits == 32 ? ieee754.fromIEEE754Single(bytes)
                                : ieee754.fromIEEE754Double(bytes);
    } else if (pattern.signed) {
      var value = 0;
      if ((bytes[bytes.length - 1] & 0x80) == 0x80) {
        var top = bytes.length - 1;
        for (var i = 0; i < top; i++) {
          value += (~bytes[i] & 0xff)  * Math.pow(256, i);
        }
        // ~1 == -2.
        // To get the two's compliment as a positive value you use ~1 & 0xff == 254. 
        value += (~(bytes[top] & 0x7f) & 0xff & 0x7f) * Math.pow(256, top);
        value += 1;
        value *= -1;
      }
      return value;
    }
  }

  function instance (packets) {
    var machine = null;
    var user = shiftify(arguments, 1, arguments.length);

    function mechanize(definition, index, value) {
      var reading = arguments.length == 2;
      var pattern = definition.pattern[index];
      var little = pattern.endianness == 'l';
      var bytes = pattern.bytes;
      var machine =
      { value: pattern.arrayed ? reading ? [] : pack(pattern, value) 
                               : reading ? 0 : value
      , unpack: pattern.arrayed ? unpack : noop
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

    function noop(value) { return value; }

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

    var outgoing;
    function send() {
      var shiftable = shiftify(arguments, 0, arguments.length);
      var nameOrPattern = shiftable.shift(); 
      if (typeof shiftable[shiftable.length - 1] == 'function') {
        machine = mechanize(
        { pattern: parse(nameOrPattern)
        , callback: shiftable.pop()
        }, 0, shiftable[0]);
      } else {
        machine = mechanize(packets[nameOrPattern], 0, shiftable[0]);
      }
      outgoing = shiftable;
    }

    function write(buffer) {
      var offset = arguments.length > 1 ? arguments[1] : 0;
      var length = arguments.length > 2 ? arguments[2] : buffer.length;
      OUTER: while (machine != null && offset < length) {
        var pattern = machine.definition.pattern[machine.index];
        if (pattern.arrayed) {
          INNER: for (;;) {
            buffer[offset] = machine.value[machine.offset];
            machine.offset += machine.increment;
            bytesWritten++;
            offset++;
            if (machine.offset == machine.terminal) break INNER;
            if (offset == length) break OUTER;
          }
        } else {
          INNER: for (;;) {
            buffer[offset] = Math.floor(machine.value / Math.pow(256, machine.offset)) & 0xff;
            machine.offset += machine.increment;
            bytesWritten++;
            offset++;
            if (machine.offset == machine.terminal) break INNER;
            if (offset == length) break OUTER;
          }
        }
        if (++machine.index == machine.definition.pattern.length) {
          machine.definition.callback.apply(null, [ engine ]);
          machine = null;
        } else {
          machine = mechanize(machine.definition, machine.index, outgoing[machine.index]);
        }
      }
    }

    function reset() {
      bytesRead = 0;
      bytesWritten = 0;
      machine = null;
    }

    var fields = [];
    var bytesRead = 0;
    var bytesWritten = 0;
    var engine = 
    { next: next
    , get bytesRead () { return bytesRead; }
    , get bytesWritten () { return bytesWritten; }
    };

    function read (buffer) {
      var offset = arguments.length > 1 ? arguments[1] : 0;
      var length = arguments.length > 2 ? arguments[2] : buffer.length;
      var b;
      OUTER: while (machine != null && offset < length) {
        if (machine.definition.pattern[machine.index].arrayed) {
          INNER: for (;;) {
            b = buffer[offset];
            bytesRead++;
            offset++;
            machine.value[machine.offset] = b;
            machine.offset += machine.increment;
            if (machine.offset == machine.terminal) break INNER;
            if (offset == length) break OUTER;
          }
        } else {
          INNER: for (;;) {
            b = buffer[offset];
            bytesRead++;
            offset++;
            machine.value += Math.pow(256, machine.offset) * b;
            machine.offset += machine.increment;
            if (machine.offset == machine.terminal) break INNER;
            if (offset == length) break OUTER;
          }
        }
        fields.push(machine.unpack(machine.value, machine.definition.pattern[machine.index]));
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

    var packet =
    { clone: clone
    , packet: packet
    , reset: reset
    , send: send
    , write: write
    , read: read
    };
    return packet;
  }

  return instance({});
};

/* vim: set ts=2 sw=2 et nowrap: */
