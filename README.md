# WASM-Require
WASM-Require loads WebAssembly biniaries and exposes same APIs as native
JavaScript module.

## Motivation
Node.js start to support WebAssembly after version 8. Developers can benefit from
the performance enhancement by replacing native JavaScript module with WebAssembly biniaries,
but it is not backward compatible. With this module, developers can write modules
in both JavaScript and WebAssembly, and WASM-Require will load the module depending
on the runtime support of WebAssembly. WASM-Require exposes same APIs for WebAssembly
biniaries as what your native JavaScript module has.

## Installation
Install from git repository
```
npm install https://github.com/jevan0307/wasm-require-sample.git
```

## Usage
To use WASM-Require to load your module, you need to put the WASM binary and
entry of native JavasScript file in the same directory.

WASM-Require support following types of module:
#### Emscripten
The WASM binary compiled by `Emscripten` will be along with a JavaScript loader, which
contains the configuration to create WebAssembly instance.   
You need to rename your JS loader with `<module_name>.emcc.js`.
#### WebAssembly binary
For normal WebAssembly binary, rename the binary to `<module_name>.wasm`
#### Native JavaScript module
For native JS module, rename the entry of module to `<module_name>.js`    
It can also be the asm.js module compiled from other language, like C++ with Emscripten.

 WASM-Require will the search module path and load the module in following order:
 1. Emscripten (if support WebAssembly)
 2. WebAssembly binary (if support WebAssembly)
 3. Native JavaScript module

### API
```
wasmRequire(module, exports[, wasmImportObject])
    .then(function (module) {
        // module is available here    
    })
```
#### Returns
`Function` Promises
#### Parameters
* `module` <String\> Path of the module, the behavior is the same as `require` in `Node.js`.
**Do not specify the extension**
* `exports` <Array\>|<Object\> The exports of module.
* `wasmImportObject` <Object\> The `importObject` used to create WebAssembly instance
see [WebAssembly.Instance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance)

See [examples](https://github.com/jevan0307/wasm-require-sample/tree/master/examples) for more details.

## Future Works
* Wrapper for `String` parameters
* Wrapper for `String` returns
* Wrapper for WASM instance as object
