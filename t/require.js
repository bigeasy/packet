module.exports = function (type, pattern, source) {
    var path = require('path'), builder = []
    builder.push('module.exports = function (incremental, pattern, transforms, ieee754, callback) {')
    builder.push.apply(builder, source.map(function (line) { return '  ' + line }))
    builder.push('}')

    builder = builder.map(function (line) { return line.replace(/^\s+$/, '') })

    console.log(builder.join('\n'))

    function namify (f, i) {
        var scalar = f.endianness + f.bits + f.type
        if (f.signed) scalar = 'S' + scalar
        if (f.named) scalar += '_' + f.name
        if (f.lengthEncoding) scalar += 'C'
        if (f.arrayed) {
            scalar += '_array'
            if (!(i && pattern[i - 1].lengthEncoding) && f.repeat != Math.MAX_VALUE) {
                scalar += f.repeat
            }
            if (f.terminator) {
                scalar += '_t' + f.terminator.join('-')
            }
        }
        if (f.packing) {
            scalar += '$' + f.packing.map(namify).join('$')
        } else if (f.alternation) {
            scalar += '@' + f.alternation.map(function (alternate) {
                return alternate.failed ? '' : alternate.pattern.map(namify)
            }).join('@')
        } else if (f.pipeline) {
            scalar += '#' + f.pipeline.map(function (transform) {
                return transform.name
            }).join('$')
        }
        return scalar
    }

    var name = type + '.' + pattern.map(namify).join('.')

    console.log(name)
    var file = path.join(__dirname, 'generated', name + '.js')
    require('fs').writeFileSync(file, builder.join('\n'), 'utf8')
    return require(file)
}
