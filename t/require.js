module.exports = function (type, pattern, parameters, source) {
    var path = require('path'), builder = []
    builder.push('module.exports = function (' + parameters.join(', ') + ') {')
    builder.push.apply(builder, source.map(function (line) { return '    ' + line }))
    builder.push('}', '')

    builder = builder.map(function (line) { return line.replace(/^\s+$/, '') })

    var name = require('./name')(type, pattern)

    console.log(name)
    var file = path.join(__dirname, 'generated', name + '.js')
    require('fs').writeFileSync(file, builder.join('\n'), 'utf8')
    return require(file)
}
