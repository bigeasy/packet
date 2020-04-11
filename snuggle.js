module.exports = function (source) {
    return source.map((when, i) => {
        if (i == 0) {
            return when
        }
        return when.replace(/^\n/, '')
    }).join(' ')
}
