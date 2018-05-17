import babel from 'rollup-plugin-babel';

export default {
  input: 'src/middleware.js',
  plugins: [
    babel({
      babelrc: false,
      exclude: ['./node_modules/**'],
      presets: [['travi', {targets: {node: 8, browser: true}, modules: false}]]
    })
  ],
  external: [
    '@travi/ioc',
    'milliseconds',
    'timeout-as-promise'
  ],
  output: [
    {file: 'lib/middleware.cjs.js', format: 'cjs', exports: 'named', sourcemap: true},
    {file: 'lib/middleware.es.js', format: 'es', sourcemap: true}
  ]
};
