import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/middleware.js',
    plugins: [
        babel({
            babelrc: false,
            exclude: ['./node_modules/**'],
            presets: ['es2015-rollup', 'stage-2']
        })
    ],
    targets: [
        {dest: 'lib/middleware.cjs.js', format: 'cjs', exports: 'named'},
        {dest: 'lib/middleware.es.js', format: 'es'}
    ]
};
