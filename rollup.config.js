import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
const base = {
  input: 'src/index.ts',
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }),
  ]
}
export default [{
  ...base,
  output: {
    file: 'build/esm/index.js',
    format: 'esm'
  }
}, {
  ...base,
  output: {
    file: 'build/cjs/index.js',
    format: 'cjs'
  },
}, {
  ...base,
  input: 'src/index.ts',
  output: {
    file: 'build/index.d.ts',
    format: 'esm'
  },
  plugins: [dts()]
}
]
