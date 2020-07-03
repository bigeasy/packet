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
    path, assignee, packet, variables, accumulators, registers, direction
}) {
    return function (inline, index) {
        const $_ = registers[0]
        if (registers.length != 1) {
            registers.shift()
        }
        if (inline.properties.length == 0) {
            return `${assignee} = (${inline.source})(${$_})`
        } else {
            const properties = {}
            for (const property of inline.properties) {
                if (property == '$_' || property == path.split('.').pop()) {
                    properties[property] = $_
                } else if (property == '$direction') {
                    properties[property] = require('util').inspect(direction)
                } else if (property == '$i') {
                    properties[property] = variables.i ? property : '[]'
                } else if (property == '$path') {
                    properties[property] = require('util').inspect(path.split('.'))
                } else if (property == packet.name || property == '$') {
                    properties[property] = packet.name
                } else if (accumulators[property]) {
                    properties[property] = `$accumulator[${util.inspect(property)}]`
                }
            }
            const body = Object.keys(properties).map(property => {
                return `${property}: ${properties[property]}`
            })
            return `${assignee} = (${inline.source})(` + $(`
                {
                    `, body.join(',\n'), `
                })
            `)
        }
    }
}
