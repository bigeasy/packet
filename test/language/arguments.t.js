require('proof')(6, okay => {
    const args = require('../../arguments')

    class Foo {
        foo ($) {}
    }
    okay(args(({ checksum: md5, $buffer }) => {}), {
        properties: [ 'checksum', '$buffer' ],
        source: '({ checksum: md5, $buffer }) => {}',
        airty: 1
    }, 'destructured')
    okay(args(new Foo().foo), {
        properties: null,
        source: 'foo ($) {}',
        airty: 1
    }, 'object member')
    okay(args(Foo.prototype.foo), {
        properties: null,
        source: 'foo ($) {}',
        airty: 1
    }, 'class member')
    okay(args((value, $) => {}), {
        properties: null,
        source: '(value, $) => {}',
        airty: 2
    }, 'arrow')
    okay(args(value => {}), {
        properties: null,
        source: 'value => {}',
        airty: 1
    }, 'arrow single argument')
    okay(args(function ($) {
    }), {
        properties: null,
        source: 'function ($) {\n}',
        airty: 1
    }, 'trimmed')
})
