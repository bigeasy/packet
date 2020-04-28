const $ = require('programmatic')

function vivify (fields) {
    const properties = []
    for (const field of fields) {
        switch (field.type) {
        case 'literal':
        case 'checkpoint':
        case 'lengthEncoding':
            break
        case 'terminated':
        case 'lengthEncoded':
            properties.push(field.name + ': []')
            break
        case 'integer':
            if (field.fields) {
                properties.push($(`
                    ${field.name}: {
                        `, vivify(field.fields), `
                    }
                `))
            } else {
                properties.push(`${field.name}: 0`)
            }
            break
        default:
            if (field.type == 'structure' || field.fields == null) {
                properties.push(field.name + ': null')
            } else {
                field.fields.forEach(function (field) {
                    properties.push(field.name + ': null')
                })
            }
            break
        }
    }
    if (properties.length == 0) {
        return null
    }
    return properties.join(',\n')
}

module.exports = vivify
