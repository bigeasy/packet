var acorn = require('acorn')
var assert = require('assert')

var source = require('fs').readFileSync('minimal.packet.js', 'utf8')
var parsed = acorn.parse(source)

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

function visitPropertySerialize (node, fields) {
    assert(node.type == 'FunctionExpression')
    assert(node.params[0].name == 'object')
    node.body.body.forEach(function (node) {
        assert(node.type == 'ExpressionStatement')
        node = node.expression
        dump(node)
        assert(node.type == 'AssignmentExpression')

        assert(node.left.type == 'MemberExpression')
        assert(node.left.object.name == 'object')
        assert(node.left.property.type == 'Identifier')
        name = node.left.property.name

        assert(node.right.type == 'CallExpression')
        assert(node.right.callee.name = '$_')

        var value = node.right.arguments[0].value

        fields.push({
            name: name,
            type: 'integer',
            endianness: 'b',
            bits: value
        })
    })
}

function visitProperty (structures, node) {
    var structure = {
        type: 'structure',
        name: node.key.name,
        fields: []
    }
    structures.push(structure)
    visitPropertySerialize(node.value, structure.fields)
    dump(structures)
}

function walk (node) {
    var structures = []

    assert(node.type == 'Program', 'program expected')

    node = node.body[0]
    assert(node.type == 'ExpressionStatement')
    assert(node.expression.left.name == 'packets')

    node = node.expression.right
    assert(node.type == 'ObjectExpression')
    node.properties.forEach(function (property) {
        visitProperty(structures, property)
    })
}

walk(parsed)
