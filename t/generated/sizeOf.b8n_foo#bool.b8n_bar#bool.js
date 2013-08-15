module.exports = function (transforms) {
  return function (object) {
    var field1, field2;

    field1 = object["foo"]
    field1 = transforms.bool(false, null, field1)

    field2 = object["bar"]
    field2 = transforms.bool(false, null, field2)

    return  2
  }

}