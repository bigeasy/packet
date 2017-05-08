var recast = require('recast')
var fs = require('fs')

var source = fs.readFileSync('t/language/source/minimal.packet.js')
var ast = recast.parse(source)

console.log(ast)
