// Node.js API.
const util = require('util')

module.exports = function (required) {
    return Object.keys(required).length != 0
        ? Object.keys(required).map(name => {
            switch (typeof required[name]) {
            case 'function':
                return `const ${name} = null`
            case 'string':
                return `const ${name} = require(${util.inspect(required[name])})`
            }
        }).join('\n') : null
}
