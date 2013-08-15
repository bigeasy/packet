module.exports = function (transforms) {
  return function (object) {
    return (
      object["array"].length +
      2
    )
  }

}