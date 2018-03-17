var wasmRequire = require("../../src/wasmRequire");

wasmRequire("./sample", ["pi"])
  .then(function(m) {
    m.pi(100000000);
  })
  .catch(function(err) {
    console.error(err);
  });
