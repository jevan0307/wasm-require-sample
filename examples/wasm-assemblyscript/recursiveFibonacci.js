var wasmRequire = require("../../src/wasmRequire");

wasmRequire("./sample", ["fibonacci"])
  .then(function(m) {
    for (var i = 0; i < 30; i++) {
      m.fibonacci(i);
    }
  })
  .catch(function(err) {
    console.error(err);
  });
