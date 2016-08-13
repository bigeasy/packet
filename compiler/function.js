var $ = require('programmatic')

module.exports = function (collection, source) {
    return new Function(collection, $([source]))
}
