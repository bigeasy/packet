exports.parser = function () {
    var $ = require('programmatic/builder')([
            {
                type: 'Identifier',
                name: 'object'
            },
            {
                type: 'Identifier',
                name: 'callback'
            }
        ], {});
    $.push({
        type: 'VariableDeclaration',
        declarations: [{
                type: 'VariableDeclarator',
                id: {
                    type: 'Identifier',
                    name: 'inc'
                },
                init: null
            }],
        kind: 'var'
    });
    $.push({
        type: 'ExpressionStatement',
        expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
                type: 'Identifier',
                name: 'inc'
            },
            right: {
                type: 'FunctionExpression',
                id: null,
                params: [
                    {
                        type: 'Identifier',
                        name: 'buffer'
                    },
                    {
                        type: 'Identifier',
                        name: 'start'
                    },
                    {
                        type: 'Identifier',
                        name: 'end'
                    },
                    {
                        type: 'Identifier',
                        name: 'index'
                    }
                ],
                defaults: [],
                body: {
                    type: 'BlockStatement',
                    body: [
                        {
                            type: 'VariableDeclaration',
                            declarations: [{
                                    type: 'VariableDeclarator',
                                    id: {
                                        type: 'Identifier',
                                        name: 'next'
                                    },
                                    init: null
                                }],
                            kind: 'var'
                        },
                        {
                            type: 'VariableDeclaration',
                            declarations: [{
                                    type: 'VariableDeclarator',
                                    id: {
                                        type: 'Identifier',
                                        name: 'bite'
                                    },
                                    init: null
                                }],
                            kind: 'var'
                        },
                        {
                            type: 'VariableDeclaration',
                            declarations: [{
                                    type: 'VariableDeclarator',
                                    id: {
                                        type: 'Identifier',
                                        name: '_byte'
                                    },
                                    init: null
                                }],
                            kind: 'var'
                        },
                        {
                            type: 'ExpressionStatement',
                            expression: {
                                type: 'AssignmentExpression',
                                operator: '=',
                                left: {
                                    type: 'MemberExpression',
                                    computed: false,
                                    object: { type: 'ThisExpression' },
                                    property: {
                                        type: 'Identifier',
                                        name: 'parse'
                                    }
                                },
                                right: {
                                    type: 'FunctionExpression',
                                    id: null,
                                    params: [
                                        {
                                            type: 'Identifier',
                                            name: 'buffer'
                                        },
                                        {
                                            type: 'Identifier',
                                            name: 'start'
                                        },
                                        {
                                            type: 'Identifier',
                                            name: 'end'
                                        }
                                    ],
                                    defaults: [],
                                    body: {
                                        type: 'BlockStatement',
                                        body: [
                                            {
                                                type: 'SwitchStatement',
                                                discriminant: {
                                                    type: 'Identifier',
                                                    name: 'index'
                                                },
                                                cases: [
                                                    {
                                                        type: 'SwitchCase',
                                                        test: {
                                                            type: 'Literal',
                                                            value: 0
                                                        },
                                                        consequent: [
                                                            {
                                                                type: 'ExpressionStatement',
                                                                expression: {
                                                                    type: 'AssignmentExpression',
                                                                    operator: '=',
                                                                    left: {
                                                                        type: 'Identifier',
                                                                        name: '_byte'
                                                                    },
                                                                    right: {
                                                                        type: 'Literal',
                                                                        value: 0
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                type: 'ExpressionStatement',
                                                                expression: {
                                                                    type: 'AssignmentExpression',
                                                                    operator: '=',
                                                                    left: {
                                                                        type: 'Identifier',
                                                                        name: 'bite'
                                                                    },
                                                                    right: {
                                                                        type: 'Literal',
                                                                        value: 0
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                type: 'ExpressionStatement',
                                                                expression: {
                                                                    type: 'AssignmentExpression',
                                                                    operator: '=',
                                                                    left: {
                                                                        type: 'Identifier',
                                                                        name: 'index'
                                                                    },
                                                                    right: {
                                                                        type: 'Literal',
                                                                        value: 1
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: 'SwitchCase',
                                                        test: {
                                                            type: 'Literal',
                                                            value: 1
                                                        },
                                                        consequent: [
                                                            {
                                                                type: 'WhileStatement',
                                                                test: {
                                                                    type: 'BinaryExpression',
                                                                    operator: '!=',
                                                                    left: {
                                                                        type: 'Identifier',
                                                                        name: 'bite'
                                                                    },
                                                                    right: {
                                                                        type: 'UnaryExpression',
                                                                        operator: '-',
                                                                        argument: {
                                                                            type: 'Literal',
                                                                            value: 1
                                                                        },
                                                                        prefix: true
                                                                    }
                                                                },
                                                                body: {
                                                                    type: 'BlockStatement',
                                                                    body: [
                                                                        {
                                                                            type: 'IfStatement',
                                                                            test: {
                                                                                type: 'BinaryExpression',
                                                                                operator: '==',
                                                                                left: {
                                                                                    type: 'Identifier',
                                                                                    name: 'start'
                                                                                },
                                                                                right: {
                                                                                    type: 'Identifier',
                                                                                    name: 'end'
                                                                                }
                                                                            },
                                                                            consequent: {
                                                                                type: 'ReturnStatement',
                                                                                argument: {
                                                                                    type: 'Identifier',
                                                                                    name: 'start'
                                                                                }
                                                                            },
                                                                            alternate: null
                                                                        },
                                                                        {
                                                                            type: 'ExpressionStatement',
                                                                            expression: {
                                                                                type: 'AssignmentExpression',
                                                                                operator: '+=',
                                                                                left: {
                                                                                    type: 'Identifier',
                                                                                    name: '_byte'
                                                                                },
                                                                                right: {
                                                                                    type: 'BinaryExpression',
                                                                                    operator: '*',
                                                                                    left: {
                                                                                        type: 'CallExpression',
                                                                                        callee: {
                                                                                            type: 'MemberExpression',
                                                                                            computed: false,
                                                                                            object: {
                                                                                                type: 'Identifier',
                                                                                                name: 'Math'
                                                                                            },
                                                                                            property: {
                                                                                                type: 'Identifier',
                                                                                                name: 'pow'
                                                                                            }
                                                                                        },
                                                                                        arguments: [
                                                                                            {
                                                                                                type: 'Literal',
                                                                                                value: 256
                                                                                            },
                                                                                            {
                                                                                                type: 'Identifier',
                                                                                                name: 'bite'
                                                                                            }
                                                                                        ]
                                                                                    },
                                                                                    right: {
                                                                                        type: 'MemberExpression',
                                                                                        computed: true,
                                                                                        object: {
                                                                                            type: 'Identifier',
                                                                                            name: 'buffer'
                                                                                        },
                                                                                        property: {
                                                                                            type: 'UpdateExpression',
                                                                                            operator: '++',
                                                                                            argument: {
                                                                                                type: 'Identifier',
                                                                                                name: 'start'
                                                                                            },
                                                                                            prefix: false
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        },
                                                                        {
                                                                            type: 'ExpressionStatement',
                                                                            expression: {
                                                                                type: 'UpdateExpression',
                                                                                operator: '--',
                                                                                argument: {
                                                                                    type: 'Identifier',
                                                                                    name: 'bite'
                                                                                },
                                                                                prefix: false
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            },
                                                            {
                                                                type: 'ExpressionStatement',
                                                                expression: {
                                                                    type: 'AssignmentExpression',
                                                                    operator: '=',
                                                                    left: {
                                                                        type: 'MemberExpression',
                                                                        computed: true,
                                                                        object: {
                                                                            type: 'Identifier',
                                                                            name: 'object'
                                                                        },
                                                                        property: {
                                                                            type: 'Literal',
                                                                            value: 'byte'
                                                                        }
                                                                    },
                                                                    right: {
                                                                        type: 'Identifier',
                                                                        name: '_byte'
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                type: 'IfStatement',
                                                test: {
                                                    type: 'AssignmentExpression',
                                                    operator: '=',
                                                    left: {
                                                        type: 'Identifier',
                                                        name: 'next'
                                                    },
                                                    right: {
                                                        type: 'CallExpression',
                                                        callee: {
                                                            type: 'Identifier',
                                                            name: 'callback'
                                                        },
                                                        arguments: [{
                                                                type: 'Identifier',
                                                                name: 'object'
                                                            }]
                                                    }
                                                },
                                                consequent: {
                                                    type: 'BlockStatement',
                                                    body: [
                                                        {
                                                            type: 'ExpressionStatement',
                                                            expression: {
                                                                type: 'AssignmentExpression',
                                                                operator: '=',
                                                                left: {
                                                                    type: 'MemberExpression',
                                                                    computed: false,
                                                                    object: { type: 'ThisExpression' },
                                                                    property: {
                                                                        type: 'Identifier',
                                                                        name: 'parse'
                                                                    }
                                                                },
                                                                right: {
                                                                    type: 'Identifier',
                                                                    name: 'next'
                                                                }
                                                            }
                                                        },
                                                        {
                                                            type: 'ReturnStatement',
                                                            argument: {
                                                                type: 'CallExpression',
                                                                callee: {
                                                                    type: 'MemberExpression',
                                                                    computed: false,
                                                                    object: { type: 'ThisExpression' },
                                                                    property: {
                                                                        type: 'Identifier',
                                                                        name: 'parse'
                                                                    }
                                                                },
                                                                arguments: [
                                                                    {
                                                                        type: 'Identifier',
                                                                        name: 'buffer'
                                                                    },
                                                                    {
                                                                        type: 'Identifier',
                                                                        name: 'start'
                                                                    },
                                                                    {
                                                                        type: 'Identifier',
                                                                        name: 'end'
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                },
                                                alternate: null
                                            },
                                            {
                                                type: 'ReturnStatement',
                                                argument: {
                                                    type: 'Identifier',
                                                    name: 'start'
                                                }
                                            }
                                        ]
                                    },
                                    rest: null,
                                    generator: false,
                                    expression: false
                                }
                            }
                        },
                        {
                            type: 'ReturnStatement',
                            argument: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'MemberExpression',
                                    computed: false,
                                    object: { type: 'ThisExpression' },
                                    property: {
                                        type: 'Identifier',
                                        name: 'parse'
                                    }
                                },
                                arguments: [
                                    {
                                        type: 'Identifier',
                                        name: 'buffer'
                                    },
                                    {
                                        type: 'Identifier',
                                        name: 'start'
                                    },
                                    {
                                        type: 'Identifier',
                                        name: 'end'
                                    }
                                ]
                            }
                        }
                    ]
                },
                rest: null,
                generator: false,
                expression: false
            }
        }
    });
    $.push({
        type: 'ReturnStatement',
        argument: {
            type: 'FunctionExpression',
            id: null,
            params: [
                {
                    type: 'Identifier',
                    name: 'buffer'
                },
                {
                    type: 'Identifier',
                    name: 'start'
                },
                {
                    type: 'Identifier',
                    name: 'end'
                }
            ],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [
                    {
                        type: 'VariableDeclaration',
                        declarations: [{
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'next'
                                },
                                init: null
                            }],
                        kind: 'var'
                    },
                    {
                        type: 'IfStatement',
                        test: {
                            type: 'BinaryExpression',
                            operator: '<',
                            left: {
                                type: 'BinaryExpression',
                                operator: '-',
                                left: {
                                    type: 'Identifier',
                                    name: 'end'
                                },
                                right: {
                                    type: 'Identifier',
                                    name: 'start'
                                }
                            },
                            right: {
                                type: 'Literal',
                                value: 1
                            }
                        },
                        consequent: {
                            type: 'BlockStatement',
                            body: [{
                                    type: 'ReturnStatement',
                                    argument: {
                                        type: 'CallExpression',
                                        callee: {
                                            type: 'MemberExpression',
                                            computed: false,
                                            object: {
                                                type: 'Identifier',
                                                name: 'inc'
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'call'
                                            }
                                        },
                                        arguments: [
                                            { type: 'ThisExpression' },
                                            {
                                                type: 'Identifier',
                                                name: 'buffer'
                                            },
                                            {
                                                type: 'Identifier',
                                                name: 'start'
                                            },
                                            {
                                                type: 'Identifier',
                                                name: 'end'
                                            },
                                            {
                                                type: 'Literal',
                                                value: 0
                                            }
                                        ]
                                    }
                                }]
                        },
                        alternate: null
                    },
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'AssignmentExpression',
                            operator: '=',
                            left: {
                                type: 'MemberExpression',
                                computed: true,
                                object: {
                                    type: 'Identifier',
                                    name: 'object'
                                },
                                property: {
                                    type: 'Literal',
                                    value: 'byte'
                                }
                            },
                            right: {
                                type: 'MemberExpression',
                                computed: true,
                                object: {
                                    type: 'Identifier',
                                    name: 'buffer'
                                },
                                property: {
                                    type: 'Identifier',
                                    name: 'start'
                                }
                            }
                        }
                    },
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'AssignmentExpression',
                            operator: '+=',
                            left: {
                                type: 'Identifier',
                                name: 'start'
                            },
                            right: {
                                type: 'Literal',
                                value: 1
                            }
                        }
                    },
                    {
                        type: 'IfStatement',
                        test: {
                            type: 'AssignmentExpression',
                            operator: '=',
                            left: {
                                type: 'Identifier',
                                name: 'next'
                            },
                            right: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'callback'
                                },
                                arguments: [{
                                        type: 'Identifier',
                                        name: 'object'
                                    }]
                            }
                        },
                        consequent: {
                            type: 'BlockStatement',
                            body: [
                                {
                                    type: 'ExpressionStatement',
                                    expression: {
                                        type: 'AssignmentExpression',
                                        operator: '=',
                                        left: {
                                            type: 'MemberExpression',
                                            computed: false,
                                            object: { type: 'ThisExpression' },
                                            property: {
                                                type: 'Identifier',
                                                name: 'parse'
                                            }
                                        },
                                        right: {
                                            type: 'Identifier',
                                            name: 'next'
                                        }
                                    }
                                },
                                {
                                    type: 'ReturnStatement',
                                    argument: {
                                        type: 'CallExpression',
                                        callee: {
                                            type: 'MemberExpression',
                                            computed: false,
                                            object: { type: 'ThisExpression' },
                                            property: {
                                                type: 'Identifier',
                                                name: 'parse'
                                            }
                                        },
                                        arguments: [
                                            {
                                                type: 'Identifier',
                                                name: 'buffer'
                                            },
                                            {
                                                type: 'Identifier',
                                                name: 'start'
                                            },
                                            {
                                                type: 'Identifier',
                                                name: 'end'
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        alternate: null
                    },
                    {
                        type: 'ReturnStatement',
                        argument: {
                            type: 'Identifier',
                            name: 'start'
                        }
                    }
                ]
            },
            rest: null,
            generator: false,
            expression: false
        }
    });
    return $.create()
};