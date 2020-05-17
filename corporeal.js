module.exports = function corporeal (fields) {
    for (const field of fields) {
        if (field.ethereal) {
            if ('fields' in feild) {
                const found = corporeal(field.fields)
                if (found != null) {
                    return found
                }
            }
        } else {
            return field
        }
    }
}
