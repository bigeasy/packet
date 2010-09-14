/**
  This module is separated for isolation during testing. It is meant to be
  exposed as part of the public API.
 */
module.exports.parse = function (pattern) {
  function field(fields, pattern, index) {
    var match = /^(-?)([snbl])(\d+)([fha]?)(.*)$/.exec(pattern);
    if (!match) throw  new Error("invalid pattern at " + index);
    var f =
    { signed: !!match[1] || match[4] == "f"
    , endianness: match[2] == 'n' ? 'b' : match[2]
    , bits: parseInt(match[3], 10)
    , type: match[4] || 'n'
    },  rest = match[5];
    index += (f.signed ? 1 : 0) + f.endianness.length;
    if (f.bits == 0 || f.bits % 8) throw new Error("bits must be divisible by 8 at " + index);
    if (f.type == "f" && !(f.bits == 32 || f.bits == 64)) throw Error("floats can only be 32 or 64 bits at " + index);
    if (f.bits > 64 && f.type == "n") f.type = "a";
    index += f.bits.length;
    f.bytes = f.bits / 8;
    f.arrayed = f.signed || f.bytes > 8 || "ha".indexOf(f.type) != -1;
    fields.push(f);
    return rest.length == 0 ? fields : field(fields, rest, index); // recurse.
  }
  return field([], pattern, 0);
};

/* vim: set ts=2 sw=2 et nowrap: */
