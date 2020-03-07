/**
	https://github.com/datalog/barcode-svg
	under MIT license

	# barcode.js has no dependencies

	Copyright (c) 2020 Constantine
 */

'use strict';

function BARCode( B ) {

	function c128( c ) {

		c = c.charCodeAt( 0 );

		return ( c > 126 ) ? ( 128 == c ) ? 0 : c - 50 : ( c > 32 ) ? c - 32 : 0;
	}

	function check( o ) {

		var
		r = 0,
		c = o.length;

		while( c ) r += ( c-- ) * c128( o[ c ] );

		return r % 103;
	}

	function def( i ) {

		return [ 1740,1644,1638,1176,1164,1100,1224,1220,1124,1608,1604,1572,1436,1244,1230,1484,1260,1254,1650,1628,1614,1764,1652,1902,1868,1836,1830,1892,1844,1842,1752,1734,1590,1304,1112,1094,1416,1128,1122,1672,1576,1570,1464,1422,1134,1496,1478,1142,1910,1678,1582,1768,1762,1774,1880,1862,1814,1896,1890,1818,1914,1602,1930,1328,1292,1200,1158,1068,1062,1424,1412,1232,1218,1076,1074,1554,1616,1978,1556,1146,1340,1212,1182,1508,1268,1266,1956,1940,1938,1758,1782,1974,1400,1310,1118,1512,1506,1960,1954,1502,1518,1886,1966,1668,1680,1692,6379 ][ i ].toString( 2 );
	}

	function bin( o ) {

		var
		r = [],
		c = o.length;

		while( c ) r[ --c ] = parseInt( o[ c ] );

		return r;
	}

	function encode( o ) {

		var
		r = [],
		c = o.length;

		while( c ) r[ --c ] = def( c128( o[ c ] ) );

		return bin( def( 104 ) + r.join('') + def( check( o ) + 1 ) + def( 106 ) );
	}

	function abs( o ) {

		return Math.abs( parseInt( o ) ) || 0;
	}

	function ishex( c ) {

		return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test( c );
	}


	var
	b = ('string' == typeof B ) ? { msg : B } : B || {},

	msg = b.msg,
	 _l = 0,

	dim = b.dim || [  0,  0 ],
	pad = b.pad || [ 20, 16 ],
	pal = b.pal || ['#000'],

	 _w = abs( dim[ 0 ] ),
	 _h = abs( dim[ 1 ] ),
	_px = abs( pad[ 0 ] ),
	_py = abs( pad[ 1 ] ),
	_fg = pal[ 0 ],
	_bg = pal[ 1 ],

	_er = 0,
	_sx = 1,
	_sy = 1,
	dir = 0;


	if( !msg || 'string' !== typeof msg ) {

		console.warn('BCode: Expected {msg} should be not empty string!');

		msg = 'error!';
		_er =  1;
	}

	msg = encode( msg );
	 _l = msg.length;


	/* ecc: reset to default values and relative width */
	if( 0 == _w && 0 == _h ) _px = 20, _py = 16, _w = 2 * ( _l + _px ), _h = 80;

	dir = _h > _w;

	/* deal with auto width or height */
	if( 0 == _w ) _w = 2 * ( _l + _px ), dir = 0;
	if( 0 == _h ) _h = 2 * ( _l + _py ), dir = 1;


	if( _w < _px ) {

		_px = _w;
		console.warn('BCode: Expected {pad} value could not be bigger than {dim} value');
	}

	if( _h < _py ) {

		_py = _h;
		console.warn('BCode: Expected {pad} value could not be bigger than {dim} value');
	}

	if( dir ) _sy = _l; else _sx = _l;

	_sx = ( ( _w - ( 2 * _px ) ) / _sx ).toFixed( 4 );
	_sy = ( ( _h - ( 2 * _py ) ) / _sy ).toFixed( 4 );


	if( _er || !ishex( _fg ) || _bg && !ishex( _bg ) ) {

		_fg = '#b11',
		_bg = '#fee';
		console.warn('BCode: Please, double check barcode params');
	}


	return ( function() {

		function svg( n, a ) {

			n = document.createElementNS( _ns, n );

			for( var o in a || {} ) {

				n.setAttribute( o, a[ o ] );
			}

			return n;
		}

		var
		r,
		_ns = 'http://www.w3.org/2000/svg',

		path = '',
		c = _l,
		d = 0;


		while( c ) {

			msg[ --c ] && ++d && !msg[ c - 1 ] && (

				path += ( dir )

					? 'M1,' + c + 'H0v' + d + 'h1v-' + d + 'z'
					: 'M' + c + ',1h' + d +'V0h-' + d + 'v1z', d = 0
			);
		}


		r = svg('svg', {

					 'viewBox'		: [ 0, 0, _w, _h ].join(' ')
					,'width'		:  _w
					,'height'		:  _h
					,'fill'			:  _fg
					,'shape-rendering'	: 'crispEdges'
					,'xmlns'		:  _ns 
					,'version'		: '1.1'
				} );

		if( _bg ) r.appendChild( svg('path', {

					 'fill'			:  _bg
					,'d'			: 'M0,0V' + _h + 'H' + _w + 'V0H0Z'
				} ) );

		r.appendChild( svg('path', {

					 'transform'		: 'matrix(' + [ _sx, 0, 0, _sy, _px, _py ] + ')'
					,'d'			:  path
				} ) );

		return r;

	} )();
}