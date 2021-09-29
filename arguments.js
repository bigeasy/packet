// Node.js API.
const assert = require('assert')

function trim (source) {
    const $ = /\n(.*)}$/.exec(source)
    if ($ != null) {
        return source.replace(new RegExp(`^${$[1]}`, 'gm'), '')
    }
    return source
}

module.exports = function (array) {
    assert.equal(typeof array[0], 'function')

    const f = array.shift()
    let source = f.toString()

    const properties = []
    let defaulted = []
    let arity = f.length

    const SKIPS = {
        '{': { regex: /^.[^"'{}]*/, end: '}' },
        '[': { regex: /^.[^"'[\]]*/, end: ']' },
        '"': { regex: /^"[^"\\]*(?:\\[\s\S][^\\"]*)*/, end: '"' },
        '\'': { regex: /^'[^'\\]*(?:\\[\s\S][^\\']*)*/, end: '\'' }
    }

    function skip () {
        const { regex, end } = SKIPS[source[0]]
        source = source.replace(regex, '')
        if (source[0] == end) {
            source = next()
        } else {
            switch (source[0]) {
            case '{':
            case '[':
            case '\'':
            case '"':
                skip()
                break
            }
            source = next()
        }
    }

    function next () {
        return source.replace(/^.\s*/, '')
    }

    function parameters (stop) {
        while (source[0] != stop) {
            const identifier = /^([^=,:\s)}]+)\s*(.*)/.exec(source)
            if (identifier == null) {
                throw new SyntaxError('unable to match identifier: ' + source)
            }
            properties.push(identifier[1])
            source = identifier[2]
            if (source[0] == ':') {
                source = next()
                switch (source[0]) {
                case '{':
                case '[':
                    skip()
                    break
                default:
                    source = source.replace(/^[^\s=,]+\s*/, '')
                    break
                }
            }
            if (source[0] == '=') {
                source = next()
                const $ = /^(?:0|null)\s*(.*)/.exec(source)
                if ($ != null) {
                    source = $[1]
                    defaulted.push(properties[properties.length - 1])
                } else {
                    while (source[0] != ',' && source[0] != stop) {
                        switch (source[0]) {
                        case '{':
                        case '[':
                        case '\'':
                        case '"':
                            skip()
                            break
                        default:
                            const regex = /^[^[(){},'"]*/
                            source = source.replace(regex, '')
                            break
                        }
                    }
                }
            }
            if (source[0] == ',') {
                source = next()
            }
        }
    }

    const length = source.length
    const args = /^(?:function)?\s*\(\s*/
    source = source.replace(args, '')
    let positional = true
    if (source.length == length) {
        arity = f.length
    } else if (source[0] == '{') {
        positional = false
        source = next()
        parameters('}')
    } else {
        source = source.replace(/^\s*/, '')
        parameters(')')
        defaulted = defaulted.map(arg => properties.indexOf(arg))
        arity = properties.length
        properties.length = 0
    }

    const vargs = []
    while (array.length != 0 && typeof array[0] != 'function') {
        vargs.push(array.shift())
    }

    const $ = /[^(]*\(\s*{\s*(.*?)\s*}/.exec(f.toString())
    return {
        defaulted,
        positional,
        properties: properties,
        source: trim(f.toString()).replace(/^function\s*[^(]+\s*\(/, 'function ('),
        arity: arity,
        vargs: vargs
    }
}
