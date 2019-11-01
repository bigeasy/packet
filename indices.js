class Indices {
    constructor () {
        this._number = 0
        this._unused = 'jklmnopqrstuvwxyz'.split('').map(letter => `$${letter}`)
        this._used = [ '$i' ]
        this.stack = []
    }

    push () {
        const index = this._used.pop() || this._unused.shift() || `$i{this._number++}`
        this.stack.push(index)
        return index
    }

    pop () {
        this._used.push(this.stack.pop())
    }
}

module.exports = Indices
