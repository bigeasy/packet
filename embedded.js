var path = require('path')
var compiler = require('./require')
var composer = require('./parse.all')

var source = require('./t/language/compiled/embedded.json')

composer(compiler('parsers', './embedded.parse.js'), source.parse)

var serializers = { all: {} }
var composer = require('./serialize.all')
composer(compiler('serializers', './embedded.serialize.js'), source.serialize)(serializers)

var serializer = serializers.all.frame
