const fs = require('fs')
const $ = require('programmatic')

module.exports = function (collection, filename) {
    return function (source) {
        const exported = $(`
            module.exports = function (${collection}) {
                `, source, `
            }
        `)
        fs.writeFileSync(filename, exported + '\n', 'utf8')
        return require(filename)
    }
}
