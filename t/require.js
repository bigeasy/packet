module.exports = function (source) {
  var path = require('path'), builder = [];
  builder.push('module.exports = function (incremental, composition, callback) {');
  builder.push.apply(builder, source.map(function (line) { return '  ' + line }));
  builder.push('}');

  console.log(builder.join('\n'));

  var name = composition.map(function (step) {
    var f = step.field;
    var scalar = f.endianness + f.bits + f.type;
    if (f.named) scalar += '_' + f.name;
    return scalar;
  }).join('_');

  var file = path.join(__dirname, 'generated', name + '.js');
  require('fs').writeFileSync(file, builder.join('\n'), 'utf8');
  return require(file);
}
