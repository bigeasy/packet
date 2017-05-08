var acorn = require('acorn')
var assert = require('assert')
var escodegen = require('escodegen')

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

function createConditions (context, parameters, conditions, node) {
    var condition = {
        test: escodegen.generate(node.test),
        fields: []
    }
    conditions.push(condition)
    visitPropertySerialize(context, parameters, node.consequent.body, condition.fields)
    if (node.alternate != null) {
        if (node.alternate.type == 'IfStatement') {
            createConditions(context, parameters, conditions, node.alternate)
        } else {
            var condition = {
                fields: []
            }
            conditions.push(condition)
            visitPropertySerialize(context, parameters, node.alternate.body, condition.fields)
        }
    }
}

// TODO It is simple enought to look and ensure that `_` is not called inside a
// while loop, so that `_` is only called in the body of the function. It would
// be a lot of rewriting to get it to where you could include incrementalism
// anywhere, unrolling loops, switch statements, etc.
function visitPropertySerialize (context, parameters, body, fields) {
    body.forEach(function (node) {
        if (node.type == 'IfStatement') {
            var conditional = {
                type: 'condition',
                conditions: []
            }
            createConditions(context, parameters, conditional.conditions, node)
            fields.push(conditional)
        } else {
            assert(node.type == 'ExpressionStatement')
            node = node.expression
            assert(node.type == 'CallExpression')
            console.log(parameters)
            assert(node.callee.name == parameters[0], 'unknown function call')

            var arg = node.arguments[0]
            if (arg.type == 'ObjectExpression') {
                assert(arg.type == 'ObjectExpression')
                var integer = {
                    type: 'integer',
                    fields: []
                }
                arg.properties.forEach(function (property) {
                    assert(property.type == 'Property')
                    integer.fields.push({
                        type: 'integer',
                        name: property.key.name,
                        endianness: 'b',
                        bits: property.value.value
                    })
                })
                fields.push(integer)
            } else {
                assert(arg.type == 'Literal')
                assert(typeof arg.value == 'string')
                var name = arg.value

                var arg = node.arguments[1]
                if (arg.type == 'FunctionExpression') {
                    var structure = {
                        name: name,
                        type: 'structure',
                        fields: []
                    }
                    visitPropertySerialize(name, parameters, arg.body.body, structure.fields)
                    fields.push(structure)
                } else {
                    var value = arg.value

                    fields.push({
                        name: name,
                        type: 'integer',
                        endianness: 'b',
                        bits: value
                    })
                }
            }
        }
    })
}

var required = {}

function walk (source, packageName) {
    var node = acorn.parse(source)
    return astWalk(node, packageName)
}

function astWalk (node, packageName) {
    var structures = { parse: [], serialize: [] }

    // Dirty, dirty. Will change this to an object.

    assert(node.type == 'Program', 'program expected')

    node.body.forEach(function (node) {
        console.log(node)
        if (node.type == 'VariableDeclaration') {
            node.declarations.forEach(function (node) {
                assert(node.init.type == 'CallExpression')
                assert(node.init.callee.name == 'require')
                assert(node.init.arguments[0].type == 'Literal')
                required[node.id.name] = node.init.arguments[0].value
            })
        } else {
            assert(node.type == 'ExpressionStatement')
            assert(node.expression.left.type == 'MemberExpression')
            assert(node.expression.left.object.name == 'exports')
            assert(node.expression.left.property.type == 'Identifier')
            var name = node.expression.left.property.name

            node = node.expression.right
            assert(node.type == 'CallExpression')
            var callee = node.callee.name
            assert(required[callee] == packageName)
            assert(node.arguments.length > 0)
            assert(node.arguments[0].type == 'FunctionExpression')
            node = node.arguments[0]
            assert(node.params.length >= 2, 'at least two arguments')
            var parameters = node.params.map(function (node) {
                return node.name
            })
            var body = node.body.body
            var structure = {
                type: 'structure',
                name: name,
                fields: []
            }
            structures.serialize.push(structure)
            visitPropertySerialize('object', parameters, body, structure.fields)
            var structure = {
                type: 'structure',
                name: name,
                fields: []
            }
            structures.parse.push(structure)
            visitPropertySerialize('object', parameters, body, structure.fields)
        }
    })

    return structures
}

exports.walk = walk
exports.astWalk = astWalk
