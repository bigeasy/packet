module.exports.create = function () {
  var parse = require('./__internal/pattern').parse;

  var packets = {};

  return {
    packet: function (name, pattern) {
      packets[name] = parse(pattern);
    },
    reader: function (start) {
      var packet = packets[start];
      return function (buffer, offset, length) {
        var i = offset;
        while (i < length) {
          i++;
        }
      }
    }
  };
};

/* vim: set ts=2 sw=2 et nowrap: */
