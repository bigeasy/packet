exports.serialize = function (field) {
    const variables = { packet: true, step: true }
    function declare (field) {
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
                variables.accumulator = true
                field.fields.map(declare)
            }
            break
        case 'structure': {
                field.fields.map(declare)
            }
            break
        case 'lengthEncoded': {
                variables.i = true
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
        case 'integer': {
                if (field.fields != null || field.lookup != null) {
                    variables.register = true
                }
            }
            break
        case 'absent':
        case 'buffer':
        case 'checkpoint':
        case 'lengthEncoding':
        case 'terminator':
            break
        default: throw new Error(field.type)
        }
    }
    declare(field)
    return variables
}

exports.parse = function (field) {
    const variables = { packet: true, step: true }
    function declare (field) {
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
                variables.accumulator = true
                field.fields.map(declare)
            }
            break
        case 'structure': {
                field.fields.map(declare)
            }
            break
        case 'lengthEncoded': {
                variables.i = true
                variables.I = true
            }
            break
        case 'terminated': {
                variables.i = true
                if (field.fields[0].type == 'terminator') {
                    const element = field.fields.slice().pop().fields.slice().pop()
                    if (element.type == 'buffer') {
                        variables.register = true
                    } else {
                        field.fields.map(declare)
                    }
                } else {
                    field.fields.map(declare)
                }
            }
            break
        case 'repeated': {
                field.fields.map(declare)
            }
            break
        case 'switch': {
                field.cases.forEach(when => {
                    when.fields.map(declare)
                })
            }
            break
        case 'conditional': {
                if (field.parse.sip != null) {
                    variables.sip = true
                }
                field.serialize.conditions.forEach(condition => {
                    condition.fields.map(declare)
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
        case 'integer': {
                if (field.fields != null || field.lookup != null) {
                    variables.register = true
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
    }
    declare(field)
    return variables
}
