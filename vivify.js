// Node.js API.
const assert = require('assert')

const $ = require('programmatic')

function structure (path, field, assignment = ' = ', elided = false) {
    function vivify (field, elided, name = null) {
        // **TODO** This is a mess. Elision should descend, but the name should
        // be a property of the field in the AST. The name is what is
        // propagating up here, not downward, rather the dotted name is
        // propagating up. Might want to work on some error reporting before
        // going through the hard work of fixing everything.
        elided = elided ||
            field.type == 'structure' && field.dotted == '' && name == null ||
            field.type == 'integer' && field.fields != null && field.dotted == ''
        name = field.name && field.name[0] != '_' ? field.name : null || name
        switch (field.vivify) {
        case 'descend': {
                return vivify(field.fields.filter(field => {
                    return field.vivify != null
                }).pop(), elided, name)
            }
            break
        case 'elide':
        case 'object': {
                const properties = field.fields.map(field => vivify(field, false))
                                   .filter(js => !! js)
                if (elided) {
                    return properties.join(',\n')
                }
                return $(`
                    ${name}: {
                        `, properties.join(',\n'), `
                    }
                `)
            }
            break
        case 'number': {
                return `${name}: 0`
            }
            break
        case 'bigint': {
                return `${name}: 0n`
            }
            break
        case 'array': {
                return `${name}: []`
            }
            break
        case 'variant': {
                return `${name}: null`
            }
            break
        }
    }
    return $(`
        ${path}${assignment}{
            `, vivify(field, true), `
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

function __TODO_dead_step (field) {
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
