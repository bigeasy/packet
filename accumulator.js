const util = require('util')
const assert = require('assert')

module.exports = function (accumulate, accumulators, parameters, delcared) {
    return delcared.length != 0 ? delcared.map(accumulator => {
        const { name, source } = accumulator
        accumulate.accumulated[name] = []
        if (accumulator.type == 'function' && parameters[name] == null) {
            return `$accumulator[${util.inspect(name)}] = (${accumulators[name]})()`
        } else {
            return `$accumulator[${util.inspect(name)}] = ${accumulators[name]}`
        }
    }).join('\n') : null
}
