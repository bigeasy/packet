function hex (value) {
    switch (typeof value) {
    case 'number':
        return `0x${value.toString(16)}`
    case 'object':
        return `[ ${value.map(value => hex(value)).join(', ')} ]`
    }
}

module.exports = hex
