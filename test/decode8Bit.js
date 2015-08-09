var assert = require( 'assert' ),
	vlq = require( '../' );

var tests = [
	[ [0x0], 0x0 ],
	[ [0x40], 0x40 ],
	[ [0x7f], 0x7f ],
	[ [0x81, 0], 0x80 ],
	[ [0xc0, 0], 0x2000 ],
	[ [0xff, 0x7f], 0x3fff ],
	[ [0x81, 0x80, 0], 0x4000 ]
];

tests.forEach( function ( test ) {
	assert.equal( vlq.decode8Bit( test[0] ), test[1] );
});

console.log( 'all vlq.decode8Bit tests passed' );
