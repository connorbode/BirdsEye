(function(root, undefined) {

  "use strict";




/* ==============================
   BirdsEye class
   ============================== */

var BirdsEye = function() {

	// Empty array of logos
	this.markers = [];

	// Add a logo
	this.addMarker = function(lat, lng, variations) {

		// If there are variations
		if(variations !== undefined) {
			throw "error";
		}

		// append the variation to the markers array
		var index = this.markers.push(new BirdsEye.Marker(lat, lng, variations));

		// return a reference to the new object
		return this.markers[index - 1];
	};

};





/* ==============================
   BirdsEye constants
   ============================== */

BirdsEye.prototype.MAX_ZOOM = 21;

BirdsEye.prototype.ERROR_MESSAGES = {

	"INVALID_LATITUDE": "latitude must be integer or double",
	"INVALID_LONGITUDE": "longitude must be integer or double",
	"INVALID_STARTZOOM": "startZoom must be integer",
	"INVALID_ENDZOOM": "endZoom must be integer",
	"STARTZOOM_EXCEEDS_MAXZOOM": "startZoom cannot exceed " + BirdsEye.prototype.MAX_ZOOM,
	"ENDZOOM_EXCEEDS_MAXZOOM": "endZoom cannot exceed " + BirdsEye.prototype.MAX_ZOOM,
	"STARTZOOM_EXCEEDS_ENDZOOM": "startZoom cannot exceed endZoom",
	"INVALID_VARIATION_IMAGE": "variation 'img' must be a string",
	"VARIATION_OVERLAP": "the variation you are trying to add overlaps an existing variation"
};

BirdsEye.prototype.LAT_LNG_REGEX = /^-?\d+(.\d+)?$/;





/* ==============================
   BirdsEye.Marker class
   ============================== */

BirdsEye.Marker = function(lat, lng, variations) {

	/* Variables */

	this.lat = lat;
	this.lng = lng;
	this.variations = [];
	this.variationRange = [];

	/* Methods */

	this.addVariation = function(img, startZoom, endZoom) {

		// check if startZoom and endZoom overlap any of the existing variation range
		for(var i = 0; i < this.variationRange.length; i++) {
			if(this.variationRange[i] >= startZoom && this.variationRange[i] <= endZoom) {
				throw BirdsEye.prototype.ERROR_MESSAGES.VARIATION_OVERLAP;
			}
		}

		// add the range to the variationRange
		for(i = startZoom; i <= endZoom; i++) {
			this.variationRange.push(i);
		}

		try {
			var index = this.variations.push(new BirdsEye.Variation(img, startZoom, endZoom));
			return this.variations[index - 1];
		}

		// catch any thrown exceptions
		// clear the variation arrays (to avoid some invalid test failures)
		// elevate the exceptions
		catch(e) {
			this.variations = [];
			this.variationRange = [];
			throw e;
		}
	};


	/* Init function */

	// check latitude and longitude
	if( ! BirdsEye.prototype.LAT_LNG_REGEX.test(lat) ) {
		throw BirdsEye.prototype.ERROR_MESSAGES.INVALID_LATITUDE;
	}

	if( ! BirdsEye.prototype.LAT_LNG_REGEX.test(lng) ) {
		throw BirdsEye.prototype.ERROR_MESSAGES.INVALID_LONGITUDE;
	}
};






/* ==============================
   BirdsEye.Variation class
   ============================== */

BirdsEye.Variation = function(img, startZoom, endZoom) {

	// A regex to test for integers
	var intRegex = /^\d+$/;

	// zoom levels should be integers
	if( !intRegex.test(startZoom) ) { // || startZoom > BirdsEye.prototype.MAX_ZOOM ) {
		throw BirdsEye.prototype.ERROR_MESSAGES.INVALID_STARTZOOM;// in the range [0, " + BirdsEye.prototype.MAX_ZOOM + "]";
	}

	if( !intRegex.test(endZoom) ) {
		throw BirdsEye.prototype.ERROR_MESSAGES.INVALID_ENDZOOM; //in the range [0, " + BirdsEye.prototype.MAX_ZOOM + "]";
	}

	// zoom levels should not exceed max zoom
	if( startZoom > BirdsEye.prototype.MAX_ZOOM ) {
		throw BirdsEye.prototype.ERROR_MESSAGES.STARTZOOM_EXCEEDS_MAXZOOM;
	}

	if( endZoom > BirdsEye.prototype.MAX_ZOOM ) {
		throw BirdsEye.prototype.ERROR_MESSAGES.ENDZOOM_EXCEEDS_MAXZOOM;
	}

	// startZoom should not exceed endZoom
	if( startZoom > endZoom ) {
		throw BirdsEye.prototype.ERROR_MESSAGES.STARTZOOM_EXCEEDS_ENDZOOM;
	}

	// img must be a string
	if(typeof img != 'string') {
		throw BirdsEye.prototype.ERROR_MESSAGES.INVALID_VARIATION_IMAGE;
	}

	// Assign the zoom levels to the variation
	this.startZoom = startZoom;
	this.endZoom = endZoom;

	// assign & preload the image
	this.img = img;
};








// Version.
BirdsEye.VERSION = '0.0.0';


// Export to the root, which is probably `window`.
root.BirdsEye = BirdsEye;


}(this));
