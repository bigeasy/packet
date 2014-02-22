module.exports = function (source) {
    var i = 0, variables = []
    while (i < source.length) {
        if (source[i] == '\n') {
            source[i] = '"__nl__"'
        }
        i++;
    }
    return source.join('\n')
}
