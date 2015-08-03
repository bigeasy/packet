var $ = require('programmatic')

module.exports = function (source) {
    return new Function([], $([source]))()
}
