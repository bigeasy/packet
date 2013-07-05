module.exports = function (pattern, source) {
  var path = require('path'), builder = [];
  builder.push('module.exports = function (incremental, pattern, callback) {');
  builder.push.apply(builder, source.map(function (line) { return '  ' + line }));
  builder.push('}');

  builder = builder.map(function (line) { return line.replace(/^\s+$/, '') });

  console.log(builder.join('\n'));

  var name = pattern.map(function (f) {
    var scalar = f.endianness + f.bits + f.type;
    if (f.named) scalar += '.' + f.name;
    if (f.arrayed) scalar += '.array'
    return scalar;
  }).join('_');

  var file = path.join(__dirname, 'generated', name + '.js');
  require('fs').writeFileSync(file, builder.join('\n'), 'utf8');
  return require(file);
}
