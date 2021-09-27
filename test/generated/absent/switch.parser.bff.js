module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let object = {
                        value: null
                    }

                    switch (($ => 0)(object)) {
                    case 0:
                        object.value = null

                        break

                    case undefined:
                        object.value = null

                        break
                    }

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
