module.exports = require('proof')(function () {
    return { parse:  require('../../tokenizer').parse }
})
