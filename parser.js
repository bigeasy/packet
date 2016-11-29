var acorn = require('acorn')
var assert = require('assert')

function dump (node) {
    console.log(require('util').inspect(node, { depth: Infinity }))
}

function visitPropertyParse (node) {
    assert(node.type == 'FunctionExpression')
    assert(node.params[0].name == 'object')
    node.body.body.forEach(function (node) {
        assert(node.type == 'ExpressionStatement')
        node = node.expression
        assert(node.type == 'CallExpression')
        switch (node.callee.name) {
        case 'unsigned':
            var arg, name, value

            arg = node.arguments[0]
            assert(arg.type == 'MemberExpression')
            assert(arg.object.name == 'object')
            assert(arg.property.type == 'Identifier')
            name = arg.property.name

            value = node.arguments[1].value
            console.log({
                name: name,
                type: 'integer',
                endianness: 'b',
                bits: value
            })
        }
    })
}

function visitPropertySerialize (parameters, body, fields) {
    body.forEach(function (node) {
        assert(node.type == 'ExpressionStatement')
        node = node.expression
        dump(node)
        assert(node.type == 'CallExpression')
        assert(node.callee.name == '_')

        var arg = node.arguments[0]
        assert(arg.type == 'MemberExpression')
        assert(arg.object.name == 'object')
        assert(arg.property.type == 'Identifier')
        var name = arg.property.name

        var arg = node.arguments[1]
        var value = arg.value

        fields.push({
            name: name,
            type: 'integer',
            endianness: 'b',
            bits: value
        })
    })
}

function walk (source) {
    var node = acorn.parse(source)
    var structures = { parse: [], serialize: [] }

    assert(node.type == 'Program', 'program expected')

    node.body.forEach(function (node) {
        assert(node.type == 'ExpressionStatement')
        assert(node.expression.left.type == 'MemberExpression')
        assert(node.expression.left.object.name == 'packets')
        assert(node.expression.left.property.type == 'Identifier')
        var name = node.expression.left.property.name

        assert(node.expression.right.type == 'FunctionExpression')
        var parameters = node.expression.right.params.map(function (node) {
            return node.name
        })
        var body = node.expression.right.body.body
        var structure = {
            type: 'structure',
            name: name,
            fields: []
        }
        structures.serialize.push(structure)
        visitPropertySerialize(parameters, body, structure.fields)
        var structure = {
            type: 'structure',
            name: name,
            fields: []
        }
        structures.parse.push(structure)
        visitPropertySerialize(parameters, body, structure.fields)
    })

    return structures
}

exports.walk = walk
