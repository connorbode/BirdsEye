

/* ==============================
   BirdsEye class
   ============================== */

var BirdsEye = function(markers) {

	/** variables **/
	this.markers = [];
	this.events = [];

	/** functions **/
	this.addMarker = function(lat, lng, variations) {

		// append the variation to the markers array
		var index = this.markers.push(new BirdsEye.Marker(lat, lng, variations));

		// return a reference to the new object
		return this.markers[index - 1];
	};

	this.setPin = function(google, map, marker) {

		var pin = new google.maps.Marker({
			position: new google.maps.LatLng(marker.lat, marker.lng),
		});
		pin.setMap(map);
		return pin;
	};

	this.attackMap = function(google, map) {

		// Get current zoom
		var zoom = map.getZoom();

		// Each key x of the events array is an array of events that occur at zoom level x
		// An event contains a pin and a value to set for the pin
		for(var i = 0; i <= BirdsEye.prototype.MAX_ZOOM; i++) {
			this.events[i] = [];
		}

		// For every marker
		for(i = 0; i < this.markers.length; i++) {

			// get the marker
			var marker = this.markers[i];

			// add the marker
			var pin = this.setPin(google, map, marker);
			this.hidePin(pin);

			// initialize an array to hold whether the marker has a value at each given zoom level
			var filled = [];
			for(var j = 0; j < BirdsEye.prototype.MAX_ZOOM; j++) {
				filled[j] = false;
			}

			// iterate through the variations
			for(j = 0; j < marker.variations.length; j++) {

				// get the variation
				var variation = marker.variations[j];

				// set events for showing the image
				this.addEvent(variation.startZoom, pin, variation.img);
				this.addEvent(variation.endZoom, pin, variation.img);

				// set the icon if the pin is in this variation
				if(zoom >= variation.startZoom && zoom <= variation.endZoom) {
					this.setPinIcon(pin, variation.img);
				}

				// mark the zoom levels filled
				for(var k = variation.startZoom; k <= variation.endZoom; k++) {
					filled[k] = true;
				}
			}

			// for any non-filled zoom levels, add null events
			for(j = 0; j < filled.length; j++) {

				if(filled[j] === false) {
					this.addEvent(j, pin, null);
				}
			}
		}

		// add the event listener to process events when zoom level changes
		google.maps.event.addListener(map, 'zoom_changed', function() {
			this.processEvents(map);
		}.bind(this));
	};

	this.addEvent = function(zoom, pin, val) {

		if(zoom >= 0 && zoom < BirdsEye.prototype.MAX_ZOOM) {
			this.events[zoom].push({
				'pin': pin,
				'val': val
			});
		}
	};

	this.processEvents = function(map) {

		var zoom = map.getZoom();

		for(var i = 0; i < this.events[zoom].length; i++) {

			var thisEvent = this.events[zoom][i];
			var pin = thisEvent.pin;
			var val = thisEvent.val;
			if(val === null) {
				this.hidePin(pin);
			} else {
				this.setPinIcon(pin, val);
			}
		}
	};

	this.hidePin = function(pin) {
		pin.setVisible(false);
	};

	this.setPinIcon = function(pin, icon) {
		pin.setIcon(icon);
		pin.setVisible(true);
	};


	/** init function **/

	// if there are markers, iterate through them and add them
	if(markers !== undefined) {
		for(var i = 0; i < markers.length; i++) {

			// add the marker
			var marker = markers[i];
			this.addMarker(marker.lat, marker.lng, marker.variations);
		}
	}
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

	// If there are variations
	if(variations !== undefined) {

		// Iterate the variations
		for(var i = 0; i < variations.length; i++) {

			var variation = variations[i];

			// Add each variation
			this.addVariation(variation.img, variation.startZoom, variation.endZoom);
		}
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
