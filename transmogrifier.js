var tokenizer = require('./tokenizer')

function field (name, definition) {
    switch (typeof definition) {
    case 'object':
        break
    case 'string':
        var token = tokenizer({ name: name }, definition)
        switch (token.type) {
        case 'integer':
        case 'buffer':
            return token
        case 'condition':
            break
        }
        break
    }
}

function structure (name, definition) {
    var fields = []
    for (var fieldName in definition) {
        fields.push(field(fieldName, definition[fieldName]))
    }
    return {
        name: name,
        type: 'structure',
        fields: fields
    }
}

module.exports = function (definition) {
    var definitions = []
    for (var name in definition) {
        definitions.push(structure(name, definition[name]))
    }
    return definitions
}

var example = {
    'b8': {
        '& 0x80': {
            name: 'b8z',
            value: 'b8z'
        },
        'default': {
        }
    }
}
