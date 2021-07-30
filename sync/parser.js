class Parser {
    constructor (definition) {
        this._definition = definition
    }

    parse (name, buffer) {
        return this._definition.parser.all[name](buffer, 0)
    }
}

module.exports = Parser
