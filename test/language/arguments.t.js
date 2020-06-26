require('proof')(11, okay => {
    const args = require('../../arguments')

    class Foo {
        foo ($) {}
    }
    okay(args(({ checksum: md5, $buffer }) => {}), {
        defaulted: [],
        properties: [ 'checksum', '$buffer' ],
        source: '({ checksum: md5, $buffer }) => {}',
        airty: 1
    }, 'destructured')
    okay(args(({ max, value = 0 }) => {}), {
        defaulted: [ 'value' ],
        properties: [ 'max', 'value' ],
        source: '({ max, value = 0 }) => {}',
        airty: 1
    }, 'assertion with zero')
    okay(args(({ max, value = null }) => {}), {
        defaulted: [ 'value' ],
        properties: [ 'max', 'value' ],
        source: '({ max, value = null }) => {}',
        airty: 1
    }, 'assertion with null')
    okay(args(({ max, value: renamed = 0 }) => {}), {
        defaulted: [ 'value' ],
        properties: [ 'max', 'value' ],
        source: '({ max, value: renamed = 0 }) => {}',
        airty: 1
    }, 'assertion destructured')
    okay(args((value, $) => {}), {
        defaulted: [],
        properties: [],
        source: '(value, $) => {}',
        airty: 2
    }, 'arrow')
    okay(args(new Foo().foo), {
        defaulted: [],
        properties: [],
        source: 'foo ($) {}',
        airty: 1
    }, 'object member')
    okay(args(Foo.prototype.foo), {
        defaulted: [],
        properties: [],
        source: 'foo ($) {}',
        airty: 1
    }, 'class member')
    okay(args(value => {}), {
        defaulted: [],
        properties: [],
        source: 'value => {}',
        airty: 1
    }, 'arrow single argument')
    okay(args(function ($) {
    }), {
        defaulted: [],
        properties: [],
        source: 'function ($) {\n}',
        airty: 1
    }, 'trimmed')
    okay(args(({ value = 0 }) => {}), {
        defaulted: [ 'value' ],
        properties: [ 'value' ],
        source: '({ value = 0 }) => {}',
        airty: 1
    }, 'assertion')
    okay(args(({ $: { header: { mask: m = 0, string = "\"\}" } }, value = 0 }) => { return value }), {
        defaulted: [ 'value' ],
        properties: [ '$', 'value' ],
        source: '({ $: { header: { mask: m = 0, string = "\\"\\}" } }, value = 0 }) => { return value }',
        airty: 1
    }, 'super ugly')
})
