require('proof')(module, function (body, assert) {
    body(require('../../tokenizer').parse, assert)
})
