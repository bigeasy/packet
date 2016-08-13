var fs = require('fs')
var $ = require('programmatic')

module.exports = function (collection, filename) {
    return function (source) {
        var exported = $(['                                                 \n\
        module.exports = function (' + collection + ') {                    \n\
            ', source, '                                                    \n\
        }'])
        fs.writeFileSync(filename, exported + '\n', 'utf8')
        return require(filename)
    }
}
