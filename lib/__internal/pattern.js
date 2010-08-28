module.exports.parse = function (pattern) {
  function field(fields, pattern, index) {
    var match = /^(-?)([snbl])(\d+)(.*)$/.exec(pattern);
    if (!match) throw  new Error("invalid pattern at " + index);
    var f = {
        signed: !!match[1],
        endianness: match[2] == 'n' ? 'b' : match[2],
        bits: parseInt(match[3], 10),
    },  rest = match[4];
    index += (f.signed ? 1 : 0) + f.endianness.length;
    if (f.bits % 8) throw new Error("bits must be divisible by 8 at " + index);
    index += f.bits.length;
    f.bytes = f.bits / 8;
    fields.push(f);
    return rest.length == 0 ? fields : field(fields, rest, index);
  }
  return field([], pattern, 0);
};

/* vim: set ts=2 sw=2 et nowrap: */
