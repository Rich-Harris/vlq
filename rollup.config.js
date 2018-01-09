import typescript from 'rollup-plugin-typescript';

const pkg = require('./package.json');

export default {
	input: 'src/vlq.ts',
	output: [{
		file: pkg.main,
		format: 'umd',
		name: 'vlq'
	}, {
		file: pkg.module,
		format: 'es'
	}],
	plugins: [
		typescript({
			exclude: 'node_modules/**',
			typescript: require('typescript')
		})
	]
};
