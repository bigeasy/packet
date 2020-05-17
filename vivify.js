const $ = require('programmatic')



function property_ (field) {
    function corporeal (field) {
        if (field.ethereal && field.fields) {
            return field.fields.map(field => corporeal(field))
                               .filter(field => !! field).shift()
        }
        return field
    }
    const property = corporeal(field)
    switch (property.type) {
    case 'terminated':
    case 'lengthEncoded':
        return `${property.name}: []`
    // TODO Ensure that conditional resolves to same type in all cases or else
    // assign `null` and vivify later. (Ugh.)
    case 'conditional':
    case 'integer':
        if (property.fields) {
            return structure(property.name, property, ': ')
        } else {
            return `${property.name}: 0`
        }
    case 'structure':
        return structure(property.name, property, ': ')
    }
    return null
}

function structure (path, structure, assignment = ' = ') {
    const properties = structure.fields.map(property_).filter(field => !! field)
    if (properties.length == 0) {
        return null
    }
    return $(`
        ${path}${assignment}{
            `, properties.join(',\n'), `
        }
    `)
}

function array (path, array) {
    function corporeal (fields) {
        for (const field of fields) {
            if (field.ethereal) {
                if ('fields' in field) {
                    const found = corporeal(field.fields)
                    if (found != null) {
                        return found
                    }
                }
            } else {
                return field
            }
        }
        return null
    }
    const assignation = corporeal(array.fields)
    switch (assignation.type) {
    case 'structure':
        return structure(path, assignation)
    case 'lengthEncoded':
    case 'terminated':
        return `${path} = []`
    default:
        return null
    }
}

exports.structure = structure
exports.array = array
