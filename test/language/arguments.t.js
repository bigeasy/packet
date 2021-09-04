require('proof')(17, okay => {
    const args = require('../../arguments')

    class Foo {
        foo ($) {}
    }
    okay(args([ ({ checksum: md5, $buffer }) => {} ]), {
        defaulted: [],
        properties: [ 'checksum', '$buffer' ],
        source: '({ checksum: md5, $buffer }) => {}',
        arity: 1,
        vargs: []
    }, 'destructured')
    okay(args([ ({ max, value = 0 }) => {} ]), {
        defaulted: [ 'value' ],
        properties: [ 'max', 'value' ],
        source: '({ max, value = 0 }) => {}',
        arity: 1,
        vargs: []
    }, 'assertion with zero')
    okay(args([ ({ max, value = null }) => {} ]), {
        defaulted: [ 'value' ],
        properties: [ 'max', 'value' ],
        source: '({ max, value = null }) => {}',
        arity: 1,
        vargs: []
    }, 'assertion with null')
    okay(args([ ({ max, value: renamed = 0 }) => {} ]), {
        defaulted: [ 'value' ],
        properties: [ 'max', 'value' ],
        source: '({ max, value: renamed = 0 }) => {}',
        arity: 1,
        vargs: []
    }, 'assertion destructured')
    okay(args([ (value, $) => {} ]), {
        defaulted: [],
        properties: [],
        source: '(value, $) => {}',
        arity: 2,
        vargs: []
    }, 'arrow')
    okay(args([ new Foo().foo ]), {
        defaulted: [],
        properties: [],
        source: 'foo ($) {}',
        arity: 1,
        vargs: []
    }, 'object member')
    okay(args([ Foo.prototype.foo ]), {
        defaulted: [],
        properties: [],
        source: 'foo ($) {}',
        arity: 1,
        vargs: []
    }, 'class member')
    okay(args([ value => {} ]), {
        defaulted: [],
        properties: [],
        source: 'value => {}',
        arity: 1,
        vargs: []
    }, 'arrow single argument')
    okay(args([ function ($) {
    } ]), {
        defaulted: [],
        properties: [],
        source: 'function ($) {\n}',
        arity: 1,
        vargs: []
    }, 'trimmed')
    okay(args([ ({ value = 0 }) => {} ]), {
        defaulted: [ 'value' ],
        properties: [ 'value' ],
        source: '({ value = 0 }) => {}',
        arity: 1,
        vargs: []
    }, 'assertion')
    okay(args([ (value = 0) => {} ]), {
        defaulted: [ 0 ],
        properties: [],
        source: '(value = 0) => {}',
        arity: 1,
        vargs: []
    }, 'assertion positional')
    okay(args([ ({ value, init = 1 }) => {} ]), {
        defaulted: [],
        properties: [ 'value', 'init' ],
        source: '({ value, init = 1 }) => {}',
        arity: 1,
        vargs: []
    }, 'non default')
    okay(args([ (value=0,init={string:'\''}) => {} ]), {
        defaulted: [ 0 ],
        properties: [],
        source: "(value=0,init={string:'\\''}) => {}",
        arity: 2,
        vargs: []
    }, 'skip single quoted in object')
    okay(args([ ({ $: { header: { mask: m = 0, string = "\"\}" } }, value = 0 }) => { return value } ]), {
        defaulted: [ 'value' ],
        properties: [ '$', 'value' ],
        source: '({ $: { header: { mask: m = 0, string = "\\"\\}" } }, value = 0 }) => { return value }',
        arity: 1,
        vargs: []
    }, 'super ugly')
    okay(args([ value => value, 1 ]), {
        defaulted: [],
        properties: [],
        source: 'value => value',
        arity: 1,
        vargs: [ 1 ]
    }, 'vargs length')
    okay(args([ value => value, 1, value => value ]), {
        defaulted: [],
        properties: [],
        source: 'value => value',
        arity: 1,
        vargs: [ 1 ]
    }, 'vargs function')
    // TODO Assert that argument is provided when not beginning with dollar
    // under or the name of the field.
    okay(args([ (max, $_ = 0) => $_, 10 ]), {
        defaulted: [ 1 ],
        properties: [],
        source: '(max, $_ = 0) => $_',
        arity: 2,
        vargs: [ 10 ]
    }, 'defaulted with arguments')
})
