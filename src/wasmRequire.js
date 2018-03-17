"use strict";
var fs = require("fs");
var path = require("path");
var getCallerFile = require("get-caller-file");
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
  var calledFrom = getCallerFile();
  var isLocalModule = /^\.{1,2}[/\\]?/.test(moduleName);
  var moduleResolvedName;
  var module;

  if (isLocalModule) {
    moduleResolvedName = path.join(path.dirname(calledFrom), moduleName);
  } else {
    moduleResolvedName = moduleName;
  }
  if (cache[moduleResolvedName]) {
    return new Promise(function(resolve, reject) {
      if (cache[moduleResolvedName].isInitialized !== false) {
        resolve(createModuleObject(cache[moduleResolvedName], moduleExports));
      } else {
        cache[moduleResolvedName].locks.push(resolve);
      }
    });
  }

  if (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.compile === "function"
  ) {
    if (fs.existsSync(moduleResolvedName + ".emcc.js")) {
      module = require(moduleResolvedName + ".emcc.js");
      cache[moduleResolvedName] = module;
      module.isInitialized = false;
      module.locks = [];
      module.onRuntimeInitialized = function() {
        module.isInitialized = true;
        for (var resolve of module.locks) {
          resolve(createModuleObject(module, moduleExports));
        }
        delete module.locks;
      };

      return new Promise(function(resolve, reject) {
        if (module.isInitialized !== false) {
          resolve(createModuleObject(module, moduleExports));
        } else {
          module.locks.push(resolve);
        }
      });
    } else if (fs.existsSync(moduleResolvedName + ".wasm")) {
      var waImports = {};

      if (typeof wasmImports === "object") {
        waImports = Object.assign({}, wasmImports);
        createWasmObjects(waImports);
      }

      return new Promise(function(resolve, reject) {
        fs.readFile(moduleResolvedName + ".wasm", function(err, data) {
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
          cache[moduleResolvedName] = module;
          return createModuleObject(module, moduleExports);
        });
    }
  }
  module = require(moduleResolvedName + ".js");
  cache[moduleResolvedName] = module;
  return new Promise(function(resolve, reject) {
    resolve(createModuleObject(module, moduleExports));
  });
}

module.exports = wasmRequire;
module.exports.cache = cache;
