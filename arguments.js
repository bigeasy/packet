function trim (source) {
    const $ = /\n(.*)}$/.exec(source)
    if ($ != null) {
        return source.replace(new RegExp(`^${$[1]}`, 'gm'), '')
    }
    return source
}

function parse (f) {
}

module.exports = function (f) {
    let source = f.toString()

    const properties = []
    const defaulted = []

    const SKIPS = {
        '{': { regex: /^.[^"'{}]*/, end: '}' },
        '[': { regex: /^.[^"'[\]]*/, end: ']' },
        '"': { regex: /^"[^"\\]*(?:\\[\s\S][^\\"]*)*/, end: '"' },
        '\'': { regex: /^'[^'\\]*(?:\\[\s\S][^\\']*)*/, end: '\'' }
    }

    function string () {
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
                skip()
                break
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

    const length = source.length
    source = source.replace(/^(?:function)?[^(]*\(\s*/, '')
    if (source.length == length) {
    } else if (source[0] == '{') {
        source = next()
        while (source[0] != '}') {
            const identifier = /^([^=,:\s}]+)\s*(.*)/.exec(source)
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
                }
            }
            if (source[0] == ',') {
                source = next()
            }
        }
    } else {
        let index = 0
        while (source[0] != ')') {
            const identifier = /^[^=,:)\s]+\s*(.*)/.exec(source)
            source = identifier[1]
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
                    defaulted.push(index)
                }
            }
            if (source[0] == ',') {
                source = next()
            }
            index++
        }
    }

    const $ = /[^(]*\(\s*{\s*(.*?)\s*}/.exec(f.toString())
    return {
        defaulted,
        properties: properties,
        source: trim(f.toString()).replace(/^function\s*[^(]+\s*\(/, 'function ('),
        arity: f.length,
        vargs: []
    }
}
