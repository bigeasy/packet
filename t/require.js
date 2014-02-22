module.exports = function (type, pattern, parameters, source) {
    var path = require('path'), builder = []
    var compile = require('../compiler')
    var pretty = require('../prettify')

    builder.push('module.exports = function (' + parameters.join(', ') + ') {')
    builder.push(source)
    builder.push('}', '')

    var name = require('./name')(type, pattern)

    console.log(name)
    var file = path.join(__dirname, 'generated', name + '.js')
    require('fs').writeFileSync(file, pretty(compile(builder)), 'utf8')
    return require(file)
}
