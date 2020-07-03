const util = require('util')

module.exports = function (accumulators, field, parameterize = false) {
    return field.accumulators.map(accumulator => {
        switch (accumulator.type) {
        case 'object': {
                const { name, value } = accumulator
                accumulators[name] = true
                return `$accumulator[${util.inspect(name)}] = ${util.inspect(value)}`
            }
        case 'regex': {
                const { name, source } = accumulator
                accumulators[name] = true
                return `$accumulator[${util.inspect(name)}] = ${source}`
            }
        }
    }).join('\n')
}
