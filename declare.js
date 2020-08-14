const $ = require('programmatic')

exports.serialize = function (field) {
    const variables = { packet: true, step: true }, accumulators = {}, parameters = {}
    let depth = 0
    function declare (field) {
        depth++
        switch (field.type) {
        case 'inline': {
                const buffered = field.before.filter(inline => {
                    return inline.properties.filter(property => {
                        return /^(?:\$buffer|\$start|\$end)$/.test(property)
                    }).length
                }).length
                if (buffered != 0) {
                    variables.starts = true
                }
                if (field.before.length - buffered != 0) {
                    variables.stack = true
                }
                field.fields.map(declare)
            }
            break
        case 'accumulator': {
                for (const accumulator of field.accumulators) {
                    if (depth == 1) {
                        variables.parameters = true
                        accumulators[accumulator.name] = accumulator.name
                        if (accumulator.type == 'function') {
                            parameters[accumulator.name] = $(`
                                (`, accumulator.source, `)()
                            `)
                        } else {
                            parameters[accumulator.name] = accumulator.source
                        }
                    } else {
                        accumulators[accumulator.name] = accumulator.source
                    }
                }
                variables.accumulator = true
                field.fields.map(declare)
            }
            break
        case 'structure': {
                field.fields.map(declare)
            }
            break
        case 'lengthEncoding': {
                field.body.encoding.map(declare)
            }
            break
        case 'lengthEncoded': {
                variables.i = true
                if (field.encoding) {
                    field.encoding.map(declare)
                }
                if (field.fields[0].type == 'buffer' && ! field.fields[0].concat) {
                    variables.I = true
                }
            }
            break
        case 'terminated': {
                variables.i = true
            }
            break
        case 'switch': {
                field.cases.forEach(when => {
                    when.fields.map(declare)
                })
            }
            break
        case 'calculation': {
                variables.I = true
            }
            break
        case 'fixed': {
                variables.i = true
                if (field.calculated) {
                    variables.I = true
                }
                field.fields.map(declare)
            }
            break
        case 'conditional': {
                field.serialize.conditions.forEach(condition => {
                    condition.fields.map(declare)
                })
            }
            break
        case 'literal': {
                if (field.before.repeat > 1 || field.after.repeat > 1) {
                    variables.i = true
                }
                field.fields.map(declare)
            }
            break
        case 'bigint':
        case 'integer': {
                if (field.fields != null || field.lookup != null) {
                    variables.register = true
                }
                if (field.fields) {
                    field.fields.map(declare)
                }
            }
            break
        case 'absent':
        case 'buffer':
        case 'checkpoint':
        case 'terminator':
            break
        default: throw new Error(field.type)
        }
        depth--
    }
    declare(field)
    return { variables, accumulators, parameters }
}

exports.parse = function (field) {
    const variables = { packet: true, step: true }, accumulators = {}, parameters = {}
    let depth = 0
    function declare (field, packed) {
        depth++
        switch (field.type) {
        case 'inline': {
                const buffered = field.before.filter(inline => {
                    return inline.properties.filter(property => {
                        return /^(?:\$buffer|\$start|\$end)$/.test(property)
                    }).length
                }).length
                if (buffered != 0) {
                    variables.starts = true
                }
                if (field.before.length - buffered != 0) {
                    variables.stack = true
                }
                field.fields.map(field => declare(field, packed))
            }
            break
        case 'accumulator': {
                for (const accumulator of field.accumulators) {
                    if (depth == 1) {
                        variables.parameters = true
                        if (accumulators.type == 'function') {
                        } else {
                        }
                        accumulators[accumulator.name] = accumulator.name
                        if (accumulator.type == 'function') {
                            parameters[accumulator.name] = $(`
                                (`, accumulator.source, `)()
                            `)
                        } else {
                            parameters[accumulator.name] = accumulator.source
                        }
                    } else {
                        accumulators[accumulator.name] = accumulator.source
                    }
                }
                variables.accumulator = true
                field.fields.map(field => declare(field, packed))
            }
            break
        case 'structure': {
                field.fields.map(field => declare(field, packed))
            }
            break
        case 'lengthEncoded': {
                variables.i = true
                variables.I = true
                field.fields.map(field => declare(field, packed))
                field.encoding.map(field => declare(field, packed))
            }
            break
        case 'terminated': {
                variables.i = true
                if (field.fields[0].type == 'terminator') {
                    const element = field.fields.slice().pop().fields.slice().pop()
                    if (element.type == 'buffer') {
                        variables.register = true
                    } else {
                        field.fields.map(field => declare(field, packed))
                    }
                } else {
                    field.fields.map(field => declare(field, packed))
                }
            }
            break
        case 'repeated': {
                field.fields.map(field => declare(field, packed))
            }
            break
        case 'switch': {
                field.cases.forEach(when => {
                    when.fields.map(field => declare(field, packed))
                })
            }
            break
        case 'conditional': {
                if (field.parse.sip != null) {
                    variables.sip = true
                }
                field.serialize.conditions.forEach(condition => {
                    condition.fields.map(field => declare(field, packed))
                })
            }
            break
        case 'calculation': {
                variables.I = true
            }
            break
        case 'fixed': {
                variables.i = true
                if (field.calculated) {
                    variables.I = true
                }
                field.fields.map(field => declare(field, packed))
            }
            break
        case 'bigint':
        case 'integer': {
                if (field.fields != null || field.lookup != null) {
                    variables.register = true
                }
                if (packed && field.compliment) {
                    variables.compliment = true
                }
                if (field.fields != null) {
                    field.fields.map(field => declare(field, true))
                }
            }
            break
        case 'absent':
        case 'buffer':
        case 'lengthEncoding':
        case 'literal':
        case 'checkpoint':
        case 'terminator':
            break
        default: throw new Error(field.type)
        }
        depth--
    }
    declare(field, false)
    return { variables, accumulators, parameters }
}
