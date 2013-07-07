module.exports = function (pattern, source) {
  var path = require('path'), builder = [];
  builder.push('module.exports = function (incremental, pattern, ieee754, callback) {');
  builder.push.apply(builder, source.map(function (line) { return '  ' + line }));
  builder.push('}');

  builder = builder.map(function (line) { return line.replace(/^\s+$/, '') });

  console.log(builder.join('\n'));

  var name = pattern.map(function (f, i) {
    var scalar = f.endianness + f.bits + f.type;
    if (f.signed) scalar = 'S' + scalar;
    if (f.named) scalar += '.' + f.name;
    if (f.lengthEncoding) scalar += 'C';
    if (f.arrayed) {
      scalar += '.array'
      if (!(i && pattern[i - 1].lengthEncoding) && f.repeat != Math.MAX_VALUE) {
        scalar += f.repeat;
      }
      if (f.terminated) {
        scalar += '_t' + f.terminated.join('-');
      }
    }
    return scalar;
  }).join('_');

    console.log(name);
  var file = path.join(__dirname, 'generated', name + '.js');
  require('fs').writeFileSync(file, builder.join('\n'), 'utf8');
  return require(file);
}
