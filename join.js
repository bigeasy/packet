const $ = require('programmatic')

// Join an array of code blocks into a single chunk separated by blank lines.

module.exports = function (blocks) {
    let block = blocks[0]
    for (let i = 1, I = blocks.length; i < I; i++) {
        block = $(`
            `, block, `

            `, blocks[i], `
        `)
    }
    return block
}
