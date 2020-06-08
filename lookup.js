module.exports = function ($lookup, path, values) {
    let iterator = $lookup
    const parts = path.split('.')
    for (let i = 0, I = parts.length - 1; i < I; i++) {
        if (!(parts[i] in iterator)) {
            iterator[parts[i]] = {}
        }
        iterator = iterator[parts[i]]
    }
    iterator[parts[parts.length - 1]] = values
}
