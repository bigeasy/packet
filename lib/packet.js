module.exports.create = function () {
  var parse = require('./__internal/pattern').parse;

  var packets = {};

  return {
    packet: function (name, pattern) {
      packets[name] = parse(pattern);
    },
    read: function (name, buffer, callback) {
      var packet = packets[name];
      var i = 0;
      while (i < packet.length) {
        i++;
      }
    }
  };
};

/* vim: set ts=2 sw=2 et nowrap: */
