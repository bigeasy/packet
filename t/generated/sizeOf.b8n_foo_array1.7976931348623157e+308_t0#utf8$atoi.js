module.exports = function (transforms) {
  return function (object) {
    var field1;

    field1 = object["foo"]
    field1 = transforms.atoi(10, false, null, field1)
    field1 = transforms.utf8(false, null, field1)

    return (
      field1.length +
      1
    )
  }

}