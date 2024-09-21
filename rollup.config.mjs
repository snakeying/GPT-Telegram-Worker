import resolve from '@rollup/plugin-node-resolve';  
import commonjs from '@rollup/plugin-commonjs';  
import json from '@rollup/plugin-json';  
import typescript from '@rollup/plugin-typescript';  

export default {  
  input: 'src/index.ts',  // 入口文件  
  output: {  
    file: 'dist/index.js',  
    format: 'es',          // 输出为 ES 模块格式  
    sourcemap: true        // 生成 sourcemap，便于调试  
  },  
  plugins: [  
    resolve(),             // 解析 node_modules 中的包  
    commonjs(),            // 将 CommonJS 模块转换为 ES6 模块  
    json(),                // 支持导入 JSON 文件  
    typescript()           // 处理 TypeScript 文件  
  ]  
};  
