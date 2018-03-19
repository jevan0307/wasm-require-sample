# AssemblyScript Example

## Compilation
```
asc sample.ts -o sample.wasm --optimize --validate --sourceMap
```

## Benchmarks
Run on Single core Intel Core i7-7600U.
### recursiveFibonacci.js

| Node version | Time | Remark |
| ------------ | ---- | ------ |
| v9.8.0       | 0.084s  | With WebAssembly |
| v8.10.0      | 0.090s  | With WebAssembly |
| v7.10.1      | 0.134s  | &nbsp; |
| v6.13.1      | 0.112s  | &nbsp; |
