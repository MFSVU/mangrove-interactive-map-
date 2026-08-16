// ============================================================
// MAIN MAP INITIALIZATION
// ============================================================


// ============================================================
// CREATE MAP
// ============================================================

var map = L.map('map', {

    center: [26.0, 34.5],

    zoom: 12,

    zoomControl: true

});


// ============================================================
// BASEMAPS
// ============================================================

var baseLayers = {};

Object.keys(BASEMAPS).forEach(function(key) {

    baseLayers[key] =
        BASEMAPS[key];

});


// ============================================================
// DEFAULT BASEMAP
// ============================================================

BASEMAPS['ESRI Satellite'].addTo(map);


// ============================================================
// AOI BOUNDARY GROUP
// ============================================================

var AOI_LAYER =
    L.layerGroup().addTo(map);


// ============================================================
// AOI GROUPS
// ============================================================
//
// Structure:
//
// AOI_001
//   ├── NDVI 2016
//   ├── NDVI 2019
//   ├── NDVI 2022
//   ├── NDVI 2025
//   ├── Mangrove Mask 2016
//   ├── Mangrove Mask 2019
//   ├── Mangrove Mask 2022
//   └── Mangrove Mask 2025
//
// ============================================================

var AOI_GROUPS = {};


// ============================================================
// CREATE AOI GROUPS
// ============================================================

AOI_NAMES.forEach(function(aoi) {

    AOI_GROUPS[aoi] = {

        all:
            L.layerGroup(),

        ndvi: {},

        mask: {}

    };


    YEARS.forEach(function(year) {

        AOI_GROUPS[aoi].ndvi[year] =
            L.layerGroup();

        AOI_GROUPS[aoi].mask[year] =
            L.layerGroup();

    });

});


// ============================================================
// OVERLAY LAYERS
// ============================================================

var overlayLayers = {

    "AOI Boundaries":
        AOI_LAYER

};


// ============================================================
// CREATE NESTED AOI GROUPS
// ============================================================
//
// Leaflet's standard layer control does not natively support
// nested groups. Therefore, the actual raster groups are
// managed programmatically while the control presents:
//
// AOI_001
// AOI_002
// AOI_003
// ...
//
// Each AOI has an "All layers" control plus individual layers.
//
// ============================================================

AOI_NAMES.forEach(function(aoi) {

    overlayLayers[aoi + " — All layers"] =
        AOI_GROUPS[aoi].all;


    YEARS.forEach(function(year) {

        overlayLayers[
            "&nbsp;&nbsp;NDVI " + year
        ] =
            AOI_GROUPS[aoi].ndvi[year];

    });


    YEARS.forEach(function(year) {

        overlayLayers[
            "&nbsp;&nbsp;Mangrove Mask " + year
        ] =
            AOI_GROUPS[aoi].mask[year];

    });

});


// ============================================================
// LAYER CONTROL
// ============================================================

var layerControl =
    L.control.layers(

        baseLayers,

        overlayLayers,

        {

            collapsed: false,

            position: 'topright'

        }

    ).addTo(map);


// ============================================================
// GLOBAL REFERENCES
// ============================================================

window.AOI_LAYER =
    AOI_LAYER;

window.AOI_GROUPS =
    AOI_GROUPS;

window.map =
    map;

window.layerControl =
    layerControl;

window.overlayLayers =
    overlayLayers;


// ============================================================
// KEEP LAYER CONTROL SCROLLABLE
// ============================================================

setTimeout(function() {

    var control =
        document.querySelector(
            '.leaflet-control-layers'
        );

    if (control) {

        control.addEventListener(
            'wheel',
            function(event) {

                event.stopPropagation();

            },
            {
                passive: true
            }
        );

    }

}, 500);


console.log(
    '🌿 Mangrove Interactive Map initialized'
);

console.log(
    'AOIs:',
    AOI_NAMES
);

console.log(
    'Years:',
    YEARS
);
