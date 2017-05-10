var path = require('path')
var composer = require('./parse.all')
var fs = require('fs')

var source = fs.readFileSync(path.resolve(__dirname, 'embedded.packet.js'), 'utf8')
var parsed = require('./parser').walk(source, './packet')

fs.writeFileSync('embedded.json', JSON.stringify(parsed, null, 2), 'utf8')
