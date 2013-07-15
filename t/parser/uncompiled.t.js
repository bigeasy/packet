#!/usr/bin/env node

require('./proof')(3, function (parseEqual) {
  parseEqual({ compile: false }, 'b8', [ 1 ], 1, 1, 'byte');
});
