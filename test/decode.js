import assert from 'assert';
import * as vlq from '../src/index.js';

var tests = [
	['AAAA', [0, 0, 0, 0]],
	['AAgBC', [0, 0, 16, 1]],
	['D', [-1]],
	['B', [-2147483648]],
	['+/////D', [2147483647]]
];

tests.forEach(function (test) {
	assert.deepEqual(vlq.decode(test[0]), test[1]);
});

console.log('all vlq.decode tests passed');
