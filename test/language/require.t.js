require('proof')(1, okay => {
    const required = require('../../required')
    okay(required({ a: 'a', b: 'b' }), [
        'const a = require(\'a\')',
        'const b = require(\'b\')'
    ].join('\n'), 'required')
})
