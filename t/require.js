module.exports = function (type, pattern, parameters, source) {
    var path = require('path'), builder = []
    var s = require('programmatic')

    builder = s(['\n\
        module.exports = function (' + parameters.join(', ') + ') { \n\
            ', source, '\n\
        }'])

    var name = require('./name')(type, pattern)
    console.log(name)
    var file = path.join(__dirname, 'generated', name + '.js')
    require('fs').writeFileSync(file, builder + '\n', 'utf8')
    return require(file)
}
