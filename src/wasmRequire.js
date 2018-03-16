"use strict";
var fs = require("fs");
var path = require("path");
/* eslint no-undef: "off" */

function createWasmObjects(obj) {
  for (var i in obj) {
    if (typeof obj[i] === "object") {
      createWasmObjects(obj[i]);
    } else if (i === "_memory") {
      obj.memory = WebAssembly.Memory(obj[i]);
    } else if (i === "_table") {
      obj.table = WebAssembly.Table(obj[i]);
    }
  }
}

function createModuleObject(module, moduleExports) {
  var moduleObj = {};
  var i, j;
  if (Array.isArray(moduleExports)) {
    for (i in moduleExports) {
      if (module[moduleExports[i]]) {
        moduleObj[moduleExports[i]] = module[moduleExports[i]];
      } else if (module["_" + moduleExports[i]]) {
        moduleObj[moduleExports[i]] = module["_" + moduleExports[i]];
      }
    }
  } else if (typeof moduleExports === "object") {
    for (i in moduleExports) {
      if (typeof moduleExports[i] === "string") {
        if (module[moduleExports[i]]) {
          moduleObj[i] = module[moduleExports[i]];
        }
      } else if (Array.isArray(moduleExports[i])) {
        for (j in moduleExports[i]) {
          if (module[moduleExports[i][j]]) {
            moduleObj[i] = module[moduleExports[i][j]];
            break;
          }
        }
      }
    }
  }

  moduleObj._wasmRequire = module;
  return moduleObj;
}

var cache = {};
function wasmRequire(moduleName, moduleExports, wasmImports) {
  var key = path.resolve(moduleName);
  var module;
  if (cache[key]) {
    return new Promise(function(resolve, reject) {
      if (cache[key].isInitialized !== false) {
        resolve(createModuleObject(cache[key]));
      } else {
        cache[key].locks.push(resolve);
      }
    });
  }

  if (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.compile === "function"
  ) {
    if (fs.existsSync(moduleName + ".emcs.js")) {
      module = require(moduleName + ".emcs.js");
      cache[key] = module;
      module.isInitialized = false;
      module.locks = [];
      module.onRuntimeInitialized = function() {
        module.isInitialized = true;
        for (var resolve of module.locks) {
          resolve(createModuleObject(module));
        }
        delete module.locks;
      };

      return new Promise(function(resolve, reject) {
        if (module.isInitialized !== false) {
          resolve(createModuleObject(module));
        } else {
          module.locks.push(resolve);
        }
      });
    } else if (fs.existsSync(moduleName + ".wasm")) {
      var waImports = {};

      if (typeof wasmImports === "object") {
        waImports = Object.assign({}, wasmImports);
        createWasmObjects(waImports);
      }

      return new Promise(function(resolve, reject) {
        fs.readFile(moduleName + ".wasm", function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      })
        .then(WebAssembly.compile)
        .then(waModule => new WebAssembly.Instance(waModule, waImports))
        .then(instance => {
          module = instance.exports;
          cache[key] = module;
          return createModuleObject(module);
        });
    }
  }
  module = require(moduleName + ".js");
  cache[key] = module;
  return new Promise(function(resolve, reject) {
    resolve(createModuleObject(module));
  });
}

module.exports = wasmRequire;
module.exports.cache = cache;
