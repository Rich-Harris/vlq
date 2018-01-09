const pkg = require('./package.json');

export default {
	input: 'src/vlq.js',
	output: [{
		file: pkg.main,
		format: 'umd',
		name: 'vlq'
	}, {
		file: pkg.module,
		format: 'es'
	}]
};
