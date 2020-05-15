const join = require('./join')

module.exports = function map (dispatch, path, fields) {
    return join(fields.map(field => dispatch(path + field.dotted, field)))
}
