var assert = require( 'assert' ),
	vlq = require( '../' );

var tests = [
	[ 0x0, '00' ],
	[ 0x40, '40' ],
	[ 0x7f, '7f' ],
	[ 0x80, '8100' ],
	[ 0x2000, 'c000' ],
	[ 0x3fff, 'ff7f' ],
	[ 0x4000, '818000' ]
];

tests.forEach( function ( test ) {
	assert.equal( vlq.encode8Bit( test[0] ).toString('hex'), test[1] );
});

console.log( 'all vlq.encode8Bit tests passed' );