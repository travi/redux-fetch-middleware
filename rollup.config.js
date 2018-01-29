import babel from 'rollup-plugin-babel';

export default {
  input: 'src/middleware.js',
  plugins: [
    babel({
      babelrc: false,
      exclude: ['./node_modules/**'],
      presets: ['es2015-rollup', 'stage-2']
    })
  ],
  external: ['@travi/ioc'],
  output: [
    {file: 'lib/middleware.cjs.js', format: 'cjs', exports: 'named', sourcemap: true},
    {file: 'lib/middleware.es.js', format: 'es', sourcemap: true}
  ]
};
