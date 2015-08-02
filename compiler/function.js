module.exports = function (source) {
    return new Function([], source)()
}
