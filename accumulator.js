const util = require('util')

module.exports = function (accumulate, field, parameterize = false) {
    return field.accumulators.map(accumulator => {
        switch (accumulator.type) {
        case 'object': {
                const { name, value } = accumulator
                accumulate.accumulator[name] = true
                return `$accumulator[${util.inspect(name)}] = ${util.inspect(value)}`
            }
        case 'regex': {
                const { name, source } = accumulator
                accumulate.accumulator[name] = true
                return `$accumulator[${util.inspect(name)}] = ${source}`
            }
        case 'function': {
                const { name, source } = accumulator
                accumulate.accumulator[name] = true
                return `$accumulator[${util.inspect(name)}] = (${source})()`
            }
        }
    }).join('\n')
}
