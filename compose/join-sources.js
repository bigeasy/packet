var $ = require('programmatic')

// Join an array of code blocks into a single chunk separated by blank lines.

module.exports = function (blocks) {
    var block = blocks[0]
    for (var i = 1, I = blocks.length; i < I; i++) {
        block = $('                                                         \n\
            ', block, '                                                     \n\
            // __blank__                                                    \n\
            ', blocks[i], '                                                 \n\
        ')
    }
    return block
}
