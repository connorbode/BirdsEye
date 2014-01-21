
/* 	======================================
	test BirdsEye
	====================================== */
test("the base function exists", function() {
  ok(BirdsEye);
});

test("can create a BirdsEye object", function() {
	var birdsEye = new BirdsEye();
	ok(birdsEye);
});






/* 	======================================
	test Marker
	====================================== */
test("can add a marker with no variations", function() {
	var birdsEye = new BirdsEye();
	birdsEye.addMarker(0, 0);
	ok(birdsEye.markers.length == 1);
});

test("can't add a marker with an invalid latitude or longitude", function() {
	var birdsEye = new BirdsEye();

	// test values & descriptions
	var testVals = [
		{
			description: "a string",
			value: "string"
		},
		{
			description: "an array",
			value: []
		},
		{
			description: "an object",
			value: {}
		},
		{
			description: "a character",
			value: 'a'
		},
		{
			description: "a boolean",
			value: true
		}
	];

	for(var i = 0; i < testVals.length; i++) {

		// test latitude
		throws(
			function() {
				birdsEye.addMarker(testVals[i].value, 0);
			},
			new RegExp(BirdsEye.prototype.ERROR_MESSAGES.INVALID_LATITUDE),
			"fails when latitude is " + testVals[i].description
		);	

		// test longitude
		throws(
			function() {
				birdsEye.addMarker(0, testVals[i].value);
			},
			new RegExp(BirdsEye.prototype.ERROR_MESSAGES.INVALID_LONGITUDE),
			"fails when longitude is " + testVals[i].description
		);
	}
});







/* 	======================================
	test Variations
	====================================== */
test("can't add variation if zoom levels are not integers", function() {
	
	var birdsEye = new BirdsEye(); // create object

	birdsEye.addMarker(0, 0);	// add a marker

	var marker = birdsEye.markers[0]; // select marker

	var testVals = [	// test data
		{
			description: "a string",
			value: "string"
		},
		{
			description: "an array",
			value: []
		},
		{
			description: "an object",
			value: {}
		},
		{
			description: "a character",
			value: 'a'
		},
		{
			description: "a boolean",
			value: true
		},
		{
			description: "a double",
			value: 2.3
		}
	];

	// iterate through test values
	for(var i = 0; i < testVals.length; i++) {

		// test value against startZoom
		throws(
			function() {
				marker.addVariation("img", testVals[i].value, 0);
			},
			new RegExp(BirdsEye.prototype.ERROR_MESSAGES.INVALID_STARTZOOM),
			"fails when startZoom is " + testVals[i].description
		);

		// test value against endZoom
		throws(
			function() {
				marker.addVariation("img", 0, testVals[i].value);
			},
			new RegExp(BirdsEye.prototype.ERROR_MESSAGES.INVALID_ENDZOOM),
			"fails when endZoom is " + testVals[i].description
		);
	}
});

test("can't add variations with zoom levels which are greater than the maximum zoom level", function() {

	// create birdsEye
	var birdsEye = new BirdsEye();

	// add a marker
	var marker = birdsEye.addMarker(0,0);

	// test that startZoom can't be greater than max zoom
	throws(
		function() {
			marker.addVariation("img", birdsEye.MAX_ZOOM + 1, 0);
		},
		new RegExp(BirdsEye.prototype.ERROR_MESSAGES.STARTZOOM_EXCEEDS_MAXZOOM),
		"fails when startZoom is greater than max zoom level"
	);

	// test that endZoom can't be greater than max zoom
	throws(
		function() {
			marker.addVariation("img", 0, birdsEye.MAX_ZOOM + 1);
		},
		new RegExp(BirdsEye.prototype.ERROR_MESSAGES.ENDZOOM_EXCEEDS_MAXZOOM),
		"fails when endZoom is greater than max zoom level"
	);
});

test("can't add variations where startZoom exceeds endZoom", function() {

	// create birdsEye
	var birdsEye = new BirdsEye();

	// add a marker
	var marker = birdsEye.addMarker(0,0);

	for(var i = 0; i < birdsEye.MAX_ZOOM - 1; i++) {
		// test that startZoom can't be greater than endZoom
		throws(
			function() {
				marker.addVariation("img", i + 1, i);
			},
			new RegExp(BirdsEye.prototype.ERROR_MESSAGES.STARTZOOM_EXCEEDS_ENDZOOM),
			"fails when startZoom is " + (i+1) + " and endZoom is " + i
		);
	}
});

test("can't add variations if image link is not a string", function() {

	// create birdseye
	var birdsEye = new BirdsEye();

	// add marker
	var marker = birdsEye.addMarker(0,0);

	// test values
	var testVals = [
		{
			description: "an integer",
			value: 2
		},
		{
			description: "an array",
			value: []
		},
		{
			description: "an object",
			value: {}
		},
		{
			description: "a boolean",
			value: true
		},
		{
			description: "a double",
			value: 2.3
		}
	];

	// iterate through test values
	for(var i = 0; i < testVals.length; i++) {

		// for each test value, make sure the attempt to
		// create a variation causes an error
		throws(
			function() {
				marker.addVariation(testVals[i].value, 0, 0);
			},
			new RegExp(BirdsEye.prototype.ERROR_MESSAGES.INVALID_VARIATION_IMAGE),
			"fails when variation image parameter is " + testVals[i].description
		);
	}
});

test("can't add variations which have a range overlap", function() {

	// create birdseye
	var birdsEye = new BirdsEye();

	// add marker
	var marker = birdsEye.addMarker(0,0);

	// add variation 1
	marker.addVariation("img_path",5,10);

	// add overlapping variation
	throws(
		function() {
			marker.addVariation("img_path",2,5);
		},
		new RegExp(BirdsEye.prototype.ERROR_MESSAGES.VARIATION_OVERLAP),
		"fails if new variation overlaps the startZoom of an existing variation"
	);

	// add overlapping variation
	throws(
		function() {
			marker.addVariation("img_path",2,7);
		},
		new RegExp(BirdsEye.prototype.ERROR_MESSAGES.VARIATION_OVERLAP),
		"fails if new variation overlaps the startZoom of an existing variation"
	);

	// add overlapping variation
	throws(
		function() {
			marker.addVariation("img_path",10,15);
		},
		new RegExp(BirdsEye.prototype.ERROR_MESSAGES.VARIATION_OVERLAP),
		"fails if new variation overlaps the endZoom of an existing variation"
	);

	// add overlapping variation
	throws(
		function() {
			marker.addVariation("img_path",7,15);
		},
		new RegExp(BirdsEye.prototype.ERROR_MESSAGES.VARIATION_OVERLAP),
		"fails if new variation overlaps the endZoom of an existing variation"
	);

	// add overlapping variation
	throws(
		function() {
			marker.addVariation("img_path",0,15);
		},
		new RegExp(BirdsEye.prototype.ERROR_MESSAGES.VARIATION_OVERLAP),
		"fails if new variation overlaps an entire existing variation"
	);
});

test("can add variations", function() {

	// add as many equal sized variations as possible.
	// variationSpan decides the size of the variation
	//     e.g. variationSpan = 1 will add variations [0,0], [1,1], [2,2], etc.
	//     e.g. variationSpan = 2 will add variations [0,1], [2,3], [4,5], etc.
	for(var variationSpan = 1; variationSpan <= BirdsEye.prototype.MAX_ZOOM; variationSpan++) {

		// create birdsEye
		var birdsEye = new BirdsEye();

		// create marker
		var marker = birdsEye.addMarker(0,0);

		// add variations
		for(var i = 0; i <= BirdsEye.prototype.MAX_ZOOM; i++) {

			// get the bound for the variation
			var minBound = variationSpan * i;
			var maxBound = minBound + variationSpan - 1;

			// if the maxbound exceeds our max zoom, break
			if(maxBound > BirdsEye.prototype.MAX_ZOOM) {
				break;
			}

			// add the variation
			ok(
				marker.addVariation("img",i,i), 
				"added variation spanning [" + i + ", " + (i + variationSpan - 1) + "]"
			);
		}
	}
});

test("can add variations as marker parameter", function() {

	// create birdsEye
	var birdsEye = new BirdsEye();

	var variations = [];

	var marker = birdsEye.addMarker(0,0, variations);

	console.log("uhh..." + variations.length);

	equal(0, 1, "test");

	// // create markers with various numbers of variations
	// for(var i = 0; i <= BirdsEye.prototype.MAX_ZOOM; i++) {


	// 	// var variations = [];


	// 	// // create the array of variations
	// 	// // for(var j = 0; j <= i; j++) {

	// 	// // 	variations.push({
	// 	// // 		"img": "img",
	// 	// // 		"startZoom": j,
	// 	// // 		"endZoom": j+1
	// 	// // 	});
	// 	// // }

	// 	// // add the marker
	// 	// var marker = birdsEye.addMarker(0, 0, variations);

	// 	// // check that the marker has the right number of variations
	// 	// equal(
	// 	// 	marker.variations.length,
	// 	// 	j,
	// 	// 	"added " + j + " variations as a marker parameter"
	// 	// );
	// }
});