function flatten (source) {
    return [].concat.apply([], source.map(function (source) {
        if (Array.isArray(source)) {
            return flatten(source)
        } else {
            return source.split(/\n/)
        }
    }))
}

module.exports = function (source) {
    var i = 0, variables = [], seen = {}, $
    source = flatten(source)
    while (i < source.length) {
        if (/^\s*"\\n"\s*$/.test(source[i])) {
            source[i] = '"__nl__"'
        } else if (!/\S/.test(source[i])) {
            source.splice(i, 1)
            continue
        } else if ($ = /^var ([\w\d_]+);$/.exec(source[i])) {
            variables.push($[1])
            source.splice(i, 1)
            continue
        }
        i++
    }
    if (variables.length) {
        source.unshift('"__nl__"')
        source.unshift.apply(source, variables.filter(function (variable) {
            var duplicate = seen[variable]
            seen[variable] = true
            return ! duplicate;
        }).map(function (variable) {
            return 'var ' + variable + ';'
        }))
    }
    return source.join('\n')
}
