import assert from 'assert';
import * as vlq from '../src/index.js';

var tests = [
	[[0, 0, 0, 0], 'AAAA'],
	[[0, 0, 16, 1], 'AAgBC'],
	[[-1], 'D'],
	[[-2147483648], 'B'],
	[[2147483647], '+/////D']
];

tests.forEach(function (test) {
	assert.equal(vlq.encode(test[0]), test[1]);
});

console.log('all vlq.encode tests passed');
