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
module.exports = function ({
    inlines, path, assignee, packet, variables, accumulators, registers, direction
}) {
    const inlined = [], buffered = [], accumulated = []
    for (const inline of inlines) {
        const is = {
            buffered: false,
            assertion: false
        }
        const $_ = registers[0]
        if (inline.properties.length == 0) {
            if (inline.defaulted[0] == 0) {
                is.assertion = true
            }
            if (is.assertion) {
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
                } else if (property == '$direction') {
                    properties[property] = util.inspect(direction)
                } else if (property == '$i') {
                    properties[property] = variables.i ? property : '[]'
                } else if (property == '$path') {
                    properties[property] = util.inspect(path.split('.'))
                } else if (property == packet.name || property == '$') {
                    properties[property] = packet.name
                } else if (accumulators[property]) {
                    properties[property] = `$accumulator[${util.inspect(property)}]`
                }
            }
            if (is.buffered) {
            } else {
                const body = Object.keys(properties).map(property => {
                    return `${property}: ${properties[property]}`
                })
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
