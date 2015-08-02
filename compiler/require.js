var fs = require('fs')
var $ = require('programmatic')

module.exports = function (filename) {
    return function (source) {
        var exported = $(['                                                 \n\
        module.exports = (function () {                                     \n\
            ', source, '                                                    \n\
        })()'])
        fs.writeFileSync(filename, exported + '\n', 'utf8')
        return require(filename)
    }
}
