var assert = require( 'assert' ),
	vlq = require( '../' );

var tests = [
	[ 'AAAA', [ 0, 0, 0, 0 ] ],
	[ 'AAgBC', [ 0, 0, 16, 1 ] ]
];

tests.forEach( function ( test ) {
	assert.deepEqual( vlq.decode( test[0] ), test[1] );
});

console.log( 'all vlq.decode tests passed' );
