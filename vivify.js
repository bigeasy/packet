// Node.js API.
const assert = require('assert')

const $ = require('programmatic')

function structure (path, field, assignment = ' = ') {
    function vivify (path, field) {
        if (field.vivify == 'descend') {
            return vivify(path + field.dotted, field.fields.filter(field => {
                return field.vivify != null
            }).pop())
        } else {
            const name = (path + field.dotted).split('.').pop()
            switch (field.vivify) {
            case 'elide':
                return field.fields.map(field => vivify(path, field))
                                   .filter(field => !! field).join(',\n')
            case 'object':
                return structure((path + field.dotted).split('.').pop(), field, ': ')
            case 'array':
                return `${name}: []`
            case 'bigint':
                return `${name}: 0n`
            case 'number':
                return `${name}: 0`
            case 'variant':
                return `${name}: null`
            case null:
                return null
            // TODO Remove when tests pass.
            default:
                console.log(field)
                throw new Error
            }
        }
    }
    while (field.vivify == 'descend') {
        field = field.fields[field.fields.length - 1]
    }
    const properties = field.fields.map(field => vivify(path, field))
                                   .filter(field => !! field)
    // assert(properties.length != 0)
    return $(`
        ${path}${assignment}{
            `, properties.join(',\n'), `
        }
    `)
}

function assignment (path, field) {
    function vivify (path, fields) {
        const field = fields[fields.length - 1]
        switch (field.vivify) {
        case 'descend':
            return vivify(path + field.dotted, field.fields)
        case 'object':
            return structure(path + field.dotted, field)
        case 'array':
            return `${path} = []`
        case 'variant':
        case 'number':
            return null
        default: throw new Error
        }
    }
    return vivify(path, field.fields)
}

function step (field) {
    function vivify (fields) {
        const field = fields[fields.length - 1]
        switch (field.vivify) {
        case 'descend':
            return vivify(field.fields)
        case 'object':
        case 'array':
            return true
        case 'variant':
        case 'number':
            return false
        default: throw new Error
        }
    }
    return vivify(field.fields)
}

// TODO Rename declaration.
exports.structure = structure
exports.assignment = assignment
exports.step = step
