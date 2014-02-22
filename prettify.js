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
var source = escodegen.generate(program, { format: { semicolons: false, quotes: 'double' } })
console.log(source.split(/\n/).map(function (line) {
    line = line.replace(/;$/, '')
    if (/^\s*"__nl__"$/.test(line)) {
        return ''
    } else {
        return line
    }
}).join('\n'))
