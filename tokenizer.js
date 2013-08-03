// Don't forget that parsers of any sort tend to be complex. A simple PEG
// grammar quickly becomes a thousand lines. This compiles to under 400 lines of
// JavaScript. You are going to find it difficult to make it much smaller.
//
// This module is separated for isolation during testing. It is not meant to be
// exposed as part of the public API.

// We don't count an initial newline as a line in our report. CoffeeScripters
// might be defining their patterns use a HERDOC.
function error (message, pattern, index) {
    var lines
    if (pattern.indexOf('\n') != -1) {
        lines = pattern.substring(0, index).split(/\n/)
        if (lines[0] == '') lines.shift()
        return message + ' at line ' + lines.length + ' character ' + (lines.pop().length + 1)
    } else {
        return message + ' at character ' + (index + 1)
    }
}

var BASE = { '0x': 16, '0': 8 }

var re = {}

function compileRegularExpressions() {
    var name, $, lines, i, I, source
    source = require('fs').readFileSync(__filename, 'utf8').split(/\r?\n/)
    for (i = 0, I = source.length; i < I; i++, $ = null) {
        for (; !$ && i < I; i++) {
            $ = /re\['([^']+)'\s*\/\*\s*$/.exec(source[i])
        }
        if ($) {
            name = $[1], lines = []
            for (; ! ($ = /^\s*(i?)\*\/\]/.exec(source[i])); i++) {
                lines.push(source[i].replace(/\/\/.*$/, '').trim())
            }
            re[name] = new RegExp(lines.join('').replace(/ /g, ''), $[1] || '')
        }
    }
}

compileRegularExpressions()

// Extract an alternation range number or bit mask from at the current pattern
// substring given by `rest`.
function number (pattern, rest, index) {
    var match = re['number' /*
        ^               // start
        (                 // capture for length
            \s*               // skip white
            (?:
                (\&?)             // test is mask
                0x([0-9a-f]+)     // hex
                |
                (\d+)             // decimal
            )
        (-)?            // range
        )
        (.*)            // rest
        $               // end
    i*/].exec(rest)

    if (! match)
        throw new Error(error('invalid number', pattern, index))

    var matched = match[1], mask = match[2], hex = match[3],
        decimal = match[4], range = match[5], rest = match[6],
        value = (hex != null) ? parseInt(hex, 16) : parseInt(decimal, 10)

    index += matched.length

    return { mask: !! mask
                  , value: value
                  , index: index
                  , range: range
                  , rest: rest
                  }
}

// Parse an alternation condition.
function condition (pattern, index, rest, struct) {
    var from = number(pattern, rest, index), match, num, to
    if (from.mask) {
        if (from.range)
            throw new Error(error('masks not permitted in ranges', pattern, index))
        struct.mask = from.value
        index = from.index
    } else {
        if (from.range) {
            to = number(pattern, from.rest, from.index)
            if (to.mask)
                throw new Error(error('masks not permitted in ranges', pattern, from.index))
            struct.minimum = from.value
            struct.maximum = to.value
            index = to.index
        } else {
            struct.minimum = struct.maximum = from.value
            index = from.index
        }
    }
    num = to || from
    if (match = /(\s*)\S/.exec(num.rest))
        throw new Error(error('invalid pattern', pattern, index + match[1].length))
    return index
}

// An alternation condition that never matches. This is not a constant for the
// sake of consistency with `always()`.
function never () {
    return {
        maximum: -Number.MAX_VALUE,
        minimum: Number.MAX_VALUE
    }
}

// Generates an alternation condition that will always match. This is not a
// constant because we build upon it to create specific conditions.
function always () {
    return {
        maximum: Number.MAX_VALUE,
        minimum: -Number.MAX_VALUE,
        mask: 0
    }
}

// Parse an alternation pattern.
function alternates (pattern, array, rest, primary, secondary, allowSecondary, index) {
    var alternate, $, startIndex
    // Chip away at the pattern.
    while (rest) {
        alternate             = {}
        alternate[primary]    = always()
        alternate[secondary]  = allowSecondary ? always() : never()

        // Match the condition and the colon prior to the pattern. If this doesn't
        // match than we assume that we have a final, default pattern.
        if ($ = /^(\s*[\&\d][^/:]*)(?:(\s*\/\s*)([^:]+))?(:\s*)(.*)$/.exec(rest)) {
            var first = $[1], delimiter = $[2], second = $[3], imparative = $[4], rest = $[5]

            startIndex = index
            condition(pattern, index, first, alternate[primary])

            // If we are allowing patterns to match write conditions, and we have a
            // write condition, parse the condition. Otherwise, the read and write
            // conditions are the same.
            if (allowSecondary) {
                if (second) {
                    condition(pattern, index, second, alternate[secondary])
                } else {
                    alternate[secondary] = alternate[primary]
                }

            // If we do not allow patterns with write conditions, raise an exception if
            // one exists.
            } else if (second) {
                var slashIndex = startIndex + first.length + delimiter.indexOf('/')
                throw new Error(error('field alternates not allowed', pattern, slashIndex))
            }

            // Increment the index.
            index += first.length + imparative.length
            if (delimiter != null) index += delimiter.length + second.length
        }

        // Check to see if we have further alternates.
        if ($ = /^(\s*)([^|]+)(\|\s*)(.*)$/.exec(rest)) {
            var padding = $[1], part = $[2], delimiter = $[3], rest = $[4]
        } else {
            var padding = '', part = rest, delimiter = '', rest = null
        }
        index += padding.length

        // Parse the alienate pattern.
        alternate.pattern = parse(pattern, part, index, 8)
        index += part.length + delimiter.length

        // Record the alternate.
        array.push(alternate)
    }
}

// Parse a part of a pattern. The `next` regular expression is replaced when we
// match bit packing patterns, with a regular expression that excludes modifiers
// that are non-applicable to bit packing patterns.
function parse (pattern, part, index, bits, next) {
    var fields = [], lengthEncoded = false, rest, $, position = 0, name

    next = next || re['field' /*
                ^               // start
                (               // track length of name and spaces
                    (\w[\w\d]*):    // name
                    \s*             // optional whitespace
                )?              // name is probably optional
                (-?)            // sign
                ([xbl])         // skip, big-endian or little-endian
                (\d+)           // bits
                ([fa]?)         // type modifier
                (.*)            // and the rest
                $               // end
    */]

    // We chip away at the pattern, removing the parts we've matched, while keeping
    // track of the index separately for error messages.
    rest = part
    for (;;) {
        // Match a packet pattern.
        $ = next.exec(rest)

        // The 8th field is a trick to reuse this method for bit packing patterns
        // which are limited in what they can do. For bit packing the 7th pattern
        // will match the rest only if it begins with a comma or named field arrow,
        // otherwise it falls to the 7th which matches.
        if (!$)
            throw new Error(error('invalid pattern', pattern, index))
        if ($[8])
            throw new Error(error('invalid pattern', pattern, index + rest.length - $[8].length))

        // The remainder of the pattern, if any.
        rest = $[7]

        // Convert the match into an object.
        var f =
        { signed:     !!$[3]
        , endianness: $[4]
        , bits:       parseInt($[5], 10)
        , type:       $[6] || 'n'
        }

        if (name) {
            f.name = name
            f.named = true
            name = null
        } else if ($[1]) {
            f.named = true
            f.name = $[2]
            index += $[1].length
        }

        // Move the character position up to the bit count.
        if ($[3]) index++
        index++

        // Check for a valid character
        if (f.bits == 0)
            throw new Error(error('bit size must be non-zero', pattern, index))
        if (f.bits % bits)
            throw new Error(error('bit size must be divisible by ' + bits, pattern, index))
        if (f.type == 'f' && !(f.bits == 32 || f.bits == 64))
            throw Error(error('floats can only be 32 or 64 bits', pattern, index))

        // Move the character position up to the rest of the pattern.
        index += $[5].length
        if ($[6]) index++

        // Set the implicit fields. Unpacking logic is inconsistent between bits and
        // bytes, but not applicable for bits anyway.
        if (f.bits > 64 && f.type == 'n') f.type = 'a'
        f.bytes = f.bits / bits
        f.exploded = !!(f.signed || f.bytes > 8 || ~'fa'.indexOf(f.type))


        // Check for bit backing. The intense rest pattern in the regex allows us to
        // skip over a nested padding specifier in the bit packing pattern, nested
        // curly brace matching for a depth of one.
        if ($ = /^{((?:(?:\w[\w\d]*):\s*)?(?:-b|b|x)(?:[^{}]+|{[^}]+})+)}(\s*,.*|\s*)$/.exec(rest)) {
            if (f.named) throw new Error(error('name forbidden', pattern, index))

            index++

            var packIndex = index

            f.repeat = 1
            f.packing   = parse(pattern, $[1], index, 1, re['pack' /*
                ^               // start
                (
                    (\w[\w\d]*):    // name
                    \s*
                )?              // name is not optional, or it won't be TODO TODO
                (-?)            // sign
                ([xb])          // skip or big-endian
                (\d+)           // bits
                ()              // never a modifier
                (               // valid tokens following size
                        \s*             // optional whitespace followed by
                        (?:
                                ,               // a comma to continue the pattern
                                |
                                {\d             // a fill character specifier
                        )
                    .*                // the rest of the pattern
                    |
                )
                (.*)            // match everything if the previous match misses
                $               // end
            */])
            rest = $[2]
            index += $[1].length + 1

            // Check that the packed bits sum up to the size of the field into which
            // they are packed.
            var sum = f.packing.reduce(function (x, y) { return x + y.bits }, 0)

            if (sum < f.bits)
                throw new Error(error('bit pack pattern underflow', pattern, packIndex))

            if (sum > f.bits)
                throw new Error(error('bit pack pattern overflow', pattern, packIndex))

        // Check for alternation.
        } else if ($ = /^\(([^)]+)\)(.*)$/.exec(rest)) {
            // todo: better error message - user may think given name is
            // unusable
            if (f.named) throw new Error(error('name forbidden', pattern, index))

            f.arrayed     = true
            var read      = $[1]
            rest          = $[2]
            var write     = null

            // See if there is a full write pattern. If not, then the pattern will be
            // the same for reads and writes, but with possible different conditions
            // for write to match an alternate.
            if ($ = /^(\s*\/\s*)\(([^)]+)\)(.*)$/.exec(rest)) {
                var slash = $[1], write = $[2], rest = $[3]
            }

            // Parse the primary alternation pattern.
            index += 1
            alternates(pattern, f.alternation = [], read, 'read', 'write', ! write, index)
            index += read.length + 1

            // Parse the full write alternation pattern, if we have one.
            if (write) {
                index += slash.length + 1
                alternates(pattern, f.alternation, write, 'write', 'read', false, index)
                index += write.length
            }

            // This condition will catch all, and let us know that no condition
            // matched.
            f.alternation.push({
                read: always(), write: always(), failed: true
            })

        // Neither bit packing nor alternation.
        } else {
            if (!f.named && f.endianness != 'x') {
                throw new Error(error('name required', pattern, index))
            }

            // Check if this is a length encoding.
            if ($ = /^\/(.*)$/.exec(rest)) {
                if (f.named) name = f.name
                delete f.name
                delete f.named
                index++
                f.lengthEncoding = true
                rest = $[1]
                f.arrayed = false
                f.repeat = 1
                lengthEncoded = true
                fields.push(f)
                // Nothing else can apply to a length encoding.
                continue
            }

            f.repeat = 1
            f.arrayed = lengthEncoded
            if (! lengthEncoded) {
                // Check for structure modifiers.
                if ($ = /^\[(\d+)\](.*)$/.exec(rest)) {
                    f.arrayed = true
                    f.repeat = parseInt($[1], 10)
                    index++
                    if (f.repeat == 0)
                        throw new Error(error('array length must be non-zero', pattern, index))
                    index += $[1].length + 1
                    rest = $[2]
                }
            }

            // Check for a padding value.
            if ($ = /^({\s*)((0x|0)?([a-f\d]+)\s*})(.*)$/i.exec(rest)) {
                var before = $[1], after = $[2], base = $[3], pad = $[4], rest = $[5]
                index += before.length
                if (isNaN(f.padding = parseInt(pad, BASE[base]))) {
                    throw new Error(error('invalid number format', pattern, index))
                }
                index += after.length
            }

            // Check for zero termination.
            if ($ = /^z(?:<(.*?>))?(.*)$/.exec(rest)) {
                index++
                rest = $[2]
                if ($[1] != null) {
                    index++
                    f.terminator = []
                    var terminator = $[1]
                    for (;;) {
                        $ = re['terminator' /*
                            ^         // start
                            (\s*)     // skip whitespace
                            (?:
                                0x([A-F-a-f00-9]{2})  // hex
                                |
                                (\d+)                 // decimal
                            )
                            (\s*)     // skip whitespace
                            ([,>])    // separator for next value or close
                            (.*)      // rest
                            $         // end
                        */].exec(terminator)
                        if (!$)
                            throw new Error(error('invalid terminator value', pattern, index))
                        var before = $[1], hex = $[2], decimal = $[3], after = $[4],
                                delimiter = $[5], terminator = $[6]
                        index += before.length
                        var numberIndex = index
                        if (hex) {
                            var value = parseInt(hex, 16)
                            index += hex.length + 2
                        } else {
                            var value = parseInt(decimal, 10)
                            index += decimal.length
                        }
                        if (value > 255)
                            throw new Error(error('terminator value out of range', pattern, numberIndex))
                        index += after.length
                        index += delimiter.length
                        f.terminator.push(value)
                        if (delimiter == '>') {
                            index += terminator.length
                            break
                        }
                    }
                } else {
                    f.terminator = [ 0 ]
                }
                f.arrayed = true
                if (f.repeat == 1) f.repeat = Number.MAX_VALUE
            }

            // Parse pipelines.
            while ($ = /^\|(\w[\w\d]*)\((\)?)(.*)/.exec(rest)) {
                index          += rest.length - $[3].length
                var transform       = { name: $[1], parameters: [] }
                rest            = $[3]
                var hasArgument     = ! $[2]

                // Regular expression to match a pipeline argument, expressed as a
                // JavaScript scalar, taken in part from
                // [json2.js](http://www.JSON.org/json2.js).
                while (hasArgument) {
                    $ = re['scalar' /*
                        ( '(?:[^\\']|\\.)+'|"(?:[^\\"]|\\.)+"   // string
                        | true | false                          // boolean
                        | null                                  // null
                        | -?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?     // number
                        )
                        (\s*,\s*|\s*\))?                        // remaining arguments
                        (.*)                                    // remaining pattern
                    */].exec(rest)
                    index += rest.length - $[3].length
                    value = eval($[1])
                    hasArgument = $[2].indexOf(')') == -1
                    rest = $[3]

                    transform.parameters.push(value)
                }

                if (!f.pipeline) f.pipeline = []
                f.pipeline.push(transform)
            }
        }

        // Record the new field pattern object.
        fields.push(f)

        // A comma indicates that we're to continue.
        if (!($ = /^(\s*,\s*)(.*)$/.exec(rest))) break

        // Reset for the next iteration.
        index += $[1].length
        rest = $[2]
        lengthEncoded = false
    }
    if (/\S/.test(rest))
        throw  new Error(error('invalid pattern', pattern, index))

    return fields
}

//#### parse(pattern)
// Parse a pattern and create a list of fields.

// The `pattern` is the pattern to parse.
module.exports.parse = function (pattern) {
    var part = pattern.replace(/\n/g, ' ').replace(/^\s+/, '')
        , index = pattern.length - part.length
    return parse(pattern, part, index, 8)
}
