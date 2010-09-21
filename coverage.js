module.exports = {
    'coverage': function () {
        var tests = [ './vows/packet-test', './vows/pattern-test' ];
        tests.forEach(function (element) {
            var o = require(element);
            for (var i in o) { o[i].run(); }
        });
    }
};
