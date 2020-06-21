function trim (source) {
    const $ = /\n(.*)}$/.exec(source)
    if ($ != null) {
        return source.replace(new RegExp(`^${$[1]}`, 'gm'), '')
    }
    return source
}

module.exports = function (f) {
    const source = f.toString()
    const $ = /[^(]*\([^{)]*{\s*(.*?)\s*}/.exec(f.toString())
    return {
        properties: $ != null
            ? $[1].split(/\s*,\s*/).map(property => property.replace(/:.*/, ''))
            : null,
        source: trim(source),
        airty: f.length
    }
}
