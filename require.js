var fs = require('fs')
var $ = require('programmatic')

module.exports = function (collection, filename) {
    return function (source) {
        var exported = $(`
            module.exports = function (${collection}) {
                `, source, `
            }
        `)
        fs.writeFileSync(filename, exported + '\n', 'utf8')
        return require(filename)
    }
}
