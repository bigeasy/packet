const $ = require('programmatic')

// Join an array of code blocks into a single chunk separated by blank lines.

module.exports = function (blocks) {
    if (blocks.length == 0) {
        return null
    }
    let block = blocks[0]
    for (let i = 1, I = blocks.length; i < I; i++) {
        block = $(`
            `, block, `

            `, blocks[i], `
        `)
    }
    return block
}
