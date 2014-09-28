var assert = require( 'assert' ),
	vlq = require( '../' );

var tests = [
	[ [ 0, 0, 0, 0 ], 'AAAA' ],
	[ [ 0, 0, 16, 1 ], 'AAgBC' ]
];

tests.forEach( function ( test ) {
	assert.equal( vlq.encode( test[0] ), test[1] );
});

console.log( 'all vlq.encode tests passed' );
