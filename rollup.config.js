import babel from 'rollup-plugin-babel';

export default {
  input: 'src/middleware.js',
  plugins: [
    babel({
      babelrc: false,
      exclude: ['./node_modules/**'],
      presets: [['env', {targets: {node: 8, browsers: ['last 2 versions']}, modules: false}]],
      plugins: [['transform-object-rest-spread', {useBuiltIns: true}]]
    })
  ],
  external: ['@travi/ioc'],
  output: [
    {file: 'lib/middleware.cjs.js', format: 'cjs', exports: 'named', sourcemap: true},
    {file: 'lib/middleware.es.js', format: 'es', sourcemap: true}
  ]
};
