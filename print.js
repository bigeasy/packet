const $ = require('programmatic')
const util = require('util')

function print (value, annotate, annotation, depth, matched) {
    switch (typeof value) {
    case 'object':
        if (Array.isArray(value)) {
            if (annotate.length == 0) {
                return util.inspect(value, { depth: null })
            }
        } else {
            const properties = []
            for (const property in value) {
                if (depth != 0 || annotate[0] == property) {
                    if (annotate.length == 1 && matched && property == annotate[0]) {
                        properties.push(`// ${annotation}`)
                    }
                    const printed = print(value[property], annotate.slice(1), annotation, depth + 1, annotate[0] == property)
                    const object = {}
                    object[property] = null
                    const name = /^{\s+([^:]+)/.exec(util.inspect(object))
                    properties.push(`${name[1]}: ${printed}`)
                }
            }
            return $(`
                {
                  `, properties.join('\n'), `
                }
            `)
        }
        break
    case 'number':
        return String(value)
        break
    }
}

module.exports = function (value, annotate, annotation) {
    return print(value, annotate, annotation, 0, true)
}
