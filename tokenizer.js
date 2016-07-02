function ok (value, message) {
    if (!value) throw new Error(message)
    return value
}

function fixed (object, rest) {
    var $ = ok(/^(\d+)](.*)$/.exec(rest), 'invalid array size')
    var repeat = +$[1], rest = $[2]
    object.repeat = repeat
    if (rest.length) {
        $ = ok(/^z(.*)$/.exec(rest), 'unknown suffix')
        return terminated(object, $[1])
    }
    return object
}

function terminated (object, rest) {
    object.terminator = [ 0 ]
    return object
}

function integer (object, endianness, rest) {
    var $ = ok(/^(\d+)(.*)$/.exec(rest), 'missing bit size')
    var bits = +$[1], rest = $[2]
    ok(bits != 0, 'bits cannot be zero')
    ok(bits % 8 == 0, 'only 8-bit bytes are supported')
    object.type = 'integer'
    object.bits = bits
    object.endianness = endianness
    if (rest.length) {
        $ = ok(/^([[z])(.*)$/.exec(rest), 'unknown suffix')
        switch ($[1]) {
        case '[':
            return fixed(object, $[2])
        case 'z':
            object.repeat = -1
            return terminated(object, $[2])
        }
    }
    return object
}

function signed (object, rest) {
    object.transforms = [ 'twosCompliment' ]
    return tokenize(object, rest)
}

function tokenize (object, rest) {
    var $ = ok(/^([-blx]|\d+|&|<|>|=)(.*)$/.exec(rest), 'invalid pattern')
    switch ($[1]) {
    case '-':
        return signed(object, $[2])
    case 'b':
    case 'l':
    case 'x':
        return integer(object, $[1], $[2])
    case '&':
    case '<':
    case '>':
    case '=':
        return condition(object, $[1], $[2])
    default:
        return range(object, +$[1], $[2])
    }
}

module.exports = function (object, string) {
    return tokenize(object, string)
}
