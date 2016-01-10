

var definitions = createDefinitionsSomehow()

function Pulling () {
    this._puller = new Puller('header', definitions.header)
}

Pulling.prototype.read = function (buffer) {
    var cursor = new Cursor(buffer)
    while ((record = this._puller.read(cursor)).complete) {
        switch (record.name) {
        case 'header':
            this._puller = new Puller('body', definitions.body)
            break
        case 'body':
            this._puller = new Puller('body', definitions.body)
            break
        }
    }
}
