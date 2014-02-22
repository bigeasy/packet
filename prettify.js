var fs = require('fs')
var esprima = require('esprima')
var escodegen = require('escodegen')
var source = fs.readFileSync(process.argv[2], 'utf8').split(/\n/).map(function (line) {
    if (!/\S/.test(line)) {
        return '"__nl__"'
    } else {
        return line
    }
}).join('\n')
var program = esprima.parse(source, { raw: true })
function walk (ast, visitor) {
    (function walk (node, parent) {
        for (var key in node) {
            if (key == 'parent') continue

            var value = node[key]
            if (Array.isArray(value)) {
                value.forEach(function (child) {
                    if (child && typeof child.type == 'string') {
                        walk(child, node)
                    }
                })
            } else if (value && typeof value.type == 'string') {
                walk(value, node)
            }
        }
        visitor(node)
    })(ast)
}
walk(program, function (node) {
    if (node.type == 'Literal' && typeof node.value == 'number' && /^0x/.test(node.raw)) {
        node.verbatim = node.raw
    }
})
var source = escodegen.generate(program, {
    format: {
        semicolons: false,
        parentheses: false,
        quotes: 'double'
    },
    verbatim: 'verbatim'
})
source = source.split(/\n/).map(function (line) {
    line = line.replace(/;$/, '')
    if (/^\s*"__nl__"$/.test(line)) {
        return ''
    } else {
        var $, fixed = []
        while ($ = /^((?:[^("]|\((?!0x)|"(?:[^\\"]|\\.)*")*)\((0x[0-9a-f]+)\)(.*)/.exec(line)) {
            fixed.push($[1], $[2])
            line = $[3]
        }
        return fixed.join('') + line
    }
})
while (source[source.length - 1] == '') source.pop()
console.log(source.join('\n'))
