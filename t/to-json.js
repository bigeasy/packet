module.exports = function (buffer) {
    var json = buffer.toJSON()
    return json.data || json
}
