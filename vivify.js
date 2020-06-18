const $ = require('programmatic')

function structure (path, field, assignment = ' = ') {
    function vivify (path, field) {
        switch (field.vivify) {
        case 'object':
            return structure((path + field.dotted).split('.').pop(), field, ': ')
        case 'array':
            return `${(path + field.dotted).split('.').pop()}: []`
        case 'number':
        case 'variant':
            return `${(path + field.dotted).split('.').pop()}: 0`
        default:
            return null
        }
    }
    const object = field.type == 'structure'
        ? field
        : field.fields[field.fields.length - 1]
    const properties = field.fields.map(field => vivify(path, field))
                                   .filter(field => !! field)
    if (properties.length == 0) {
        return null
    }
    return $(`
        ${path}${assignment}{
            `, properties.join(',\n'), `
        }
    `)
}

function array (path, field) {
    switch (field.type) {
    case 'lengthEncoded':
    case 'terminated':
    case 'repeated':
    case 'fixed':
        const element = field.fields[field.fields.length - 1]
        switch (element.type) {
        case 'structure':
            return structure(path + element.dotted, element)
        case 'lengthEncoded':
        case 'terminated':
            return `${path} = []`
        case 'fixup':
        case 'literal':
            return array(path + element.dotted, element)
        default:
            return null
        }
    default:
        return null
    }
}

exports.structure = structure
exports.array = array
