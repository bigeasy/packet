const util = require('util')

module.exports = function (accumulate, field, parameterize = false) {
    return (field.accumulators ? field.accumulators : [ field ]).map(accumulator => {
        switch (accumulator.type) {
        case 'object': {
                const { name, value } = accumulator
                accumulate.accumulator[name] = []
                return `$accumulator[${util.inspect(name)}] = ${util.inspect(value)}`
            }
        case 'regex': {
                const { name, source } = accumulator
                accumulate.accumulator[name] = []
                return `$accumulator[${util.inspect(name)}] = ${source}`
            }
        case 'function': {
                const { name, source } = accumulator
                accumulate.accumulator[name] = []
                return `$accumulator[${util.inspect(name)}] = (${source})()`
            }
        }
    }).join('\n')
}
