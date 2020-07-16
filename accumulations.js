const $ = require('programmatic')

module.exports = function accumulations ({ functions, accumulate }) {
    const accumulators = {}
    functions.forEach(f => {
        if (f != null) {
            f.properties.forEach(property => {
                if (accumulate.accumulator[property] != null) {
                    accumulators[property] = true
                }
            })
        }
    })
    const invocations = accumulate.buffered.filter(accumulator => {
        return accumulator.properties.filter(property => {
            return accumulate.accumulator[property] != null
        }).length != 0
    }).map(invocation => {
        return $(`
            `, invocation.source, `
            $starts[${invocation.start}] = $start
        `)
    })
    return invocations.length != 0 ? invocations.join('\n') : null
}
