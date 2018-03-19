# Emscripten Example

## Compilation
```
emcc sample.c -o sample.emcc.js -s WASM=1
```

## Benchmark
Run on Single core Intel Core i7-7600U.
### recursiveFibonacci.js

| Node version | Time | Remark |
| ------------ | ---- | ------ |
| v9.8.0       | 0.116s  | With WebAssembly |
| v8.10.0      | 0.122s  | With WebAssembly |
| v7.10.1      | 0.144s  | &nbsp; |
| v6.13.1      | 0.112s  | &nbsp; |

### estimatePi.js

| Node version | Time | Remark |
| ------------ | ---- | ------ |
| v7.10.1      | 1.602s  | With WebAssembly |
| v8.10.0      | 1.708s  | With WebAssembly |
| v6.13.1      | 2.050s  | &nbsp; |
| v9.8.0       | 1.990s  | &nbsp; |
