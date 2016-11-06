function qualify (name, depth) {
    return name + (depth ? depth : '')
}

module.exports = qualify
