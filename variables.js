function Variables () {
    this._variables = []
}

Variables.prototype.hoist = function (variable) {
    if (this._variables.indexOf(variable) === -1) {
        this._variables.push(variable)
        this._variables.sort()
    }
}

Variables.prototype.toString = function () {
    return this._variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')
}

module.exports = Variables
