// Node.js API.
const util = require('util')

module.exports = function (required) {
    return required != null
        ? Object.keys(required).map(name => {
            for (const name in required) {
                switch (typeof required[name]) {
                case 'function':
                    return `const ${name} = null`
                case 'string':
                    return `const ${name} = require(${util.inspect(required[name])})`
                }
            }
        }).join('\n') : null
}
