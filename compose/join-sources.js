var $ = require('programmatic')

module.exports = function (sources) {
    var source = sources[0]
    for (var i = 1, I = sources.length; i < I; i++) {
        source = $('                                                        \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            ', sources[i], '                                                \n\
        ')
    }
    return source
}
