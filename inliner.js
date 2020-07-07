// Node.js API.
const util = require('util')

// Format source code maintaining indentation.
const $ = require('programmatic')

//

// Generate inline functions, but really any function, so generate user
// specified functions. We need to generate functions with both positional and
// named arguments, lookup up those arguments in the context supplied by the
// generator.

//
module.exports = function (accumulate, path, inlines, registers, assignee = null) {
    const inlined = [], accumulated = []
    const buffered = {
        start: accumulate.buffered.length,
        end: accumulate.buffered.length
    }
    accumulate.accumulated.unshift(function () {
        const accumulated = {}
        for (const name in accumulate.accumulator) {
            accumulated[name] = []
        }
        return accumulated
    } ())
    for (const inline of inlines) {
        const is = {
            conditional: assignee == null,
            accumulated: false,
            transform: false,
            buffered: false,
            assertion: false
        }
        const $_ = registers[0]
        if (inline.properties.length == 0) {
            if (inline.defaulted[0] == 0) {
                is.assertion = true
            }
            if (is.conditional) {
                const signature = registers.concat([ accumulate.packet ]).slice(0, inline.arity)
                inlined.push(`(${inline.source})(${signature.join(', ')})`)
            } else if (is.assertion) {
                inlined.push(`; (${inline.source})(${$_})`)
            } else {
                if (registers.length != 1) {
                    registers.shift()
                }
                inlined.push(`${assignee} = (${inline.source})(${$_})`)
            }
        } else {
            const properties = {}, name = path.split('.').pop()
            for (const property of inline.properties) {
                if (property == '$_' || property == name) {
                    if (inline.defaulted.includes(property)) {
                        is.assertion = true
                    }
                    properties[property] = $_
                    is.transform = true
                } else if (property == '$direction') {
                    properties[property] = util.inspect(accumulate.direction)
                } else if (property == '$i') {
                    properties[property] = accumulate.variables.i ? property : '[]'
                } else if (property == '$path') {
                    properties[property] = util.inspect(path.split('.'))
                } else if (property == accumulate.packet || property == '$') {
                    properties[property] = accumulate.packet
                } else if (accumulate.accumulator[property]) {
                    accumulated.push(property)
                    properties[property] = `$accumulator[${util.inspect(property)}]`
                } else if (property == '$buffer') {
                    is.buffered = true
                    properties[property] = property
                } else if (property == '$start') {
                    is.buffered = true
                    properties[property] = `$starts[${buffered.end++}]`
                } else if (property == '$end') {
                    is.buffered = true
                    properties[property] = '$start'
                }
            }
            const body = Object.keys(properties).map(property => {
                return `${property}: ${properties[property]}`
            })
            if (is.conditional) {
                inlined.push(`(${inline.source})(` + $(`
                    {
                        `, body.join(',\n'), `
                    })
                `))
            } else if (is.buffered) {
                if (is.transform) {
                } else {
                    accumulated.map(property => {
                        if (!(property in accumulate.accumulated[0])) {
                            accumulate.accumulated[0] = {}
                        }
                        accumulate.accumulated[0][property] = accumulate.buffered.length
                    })
                    accumulate.buffered.push({
                        start: accumulate.buffered.length,
                        properties: inline.properties,
                        source: `; (${inline.source})(` + $(`
                            {
                                `, body.join(',\n'), `
                            })
                        `)
                    })
                }
            } else {
                if (is.assertion) {
                    inlined.push(`; (${inline.source})(` + $(`
                        {
                            `, body.join(',\n'), `
                        })
                    `))
                } else {
                    if (registers.length != 1) {
                        registers.shift()
                    }
                    inlined.push(`${assignee} = (${inline.source})(` + $(`
                        {
                            `, body.join(',\n'), `
                        })
                    `))
                }
            }
        }
    }
    return { inlined, buffered, accumulated, register: registers[0] }
}
