import packageConfig from './package.json';
import typescript from "@rollup/plugin-typescript"

export default {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: packageConfig.main,
    }, {
      format: 'esm',
      file: packageConfig.module,
    }
  ],
  plugins: [
    typescript(),
  ]
}