import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'build/cjs/index.js',
      format: 'cjs'
    },
    {
      file: 'build/esm/index.js',
      format: 'esm'
    }
  ],
  plugins: [typescript()]
}
