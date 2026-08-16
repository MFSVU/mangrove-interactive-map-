// ============================================================
// MAIN MAP INITIALIZATION
// ============================================================


// ============================================================
// CREATE MAP
// ============================================================

var map =
    L.map(
        "map",
        {

            center:
                [26.0, 34.5],

            zoom:
                12,

            zoomControl:
                true

        }
    );


// ============================================================
// BASEMAPS
// ============================================================

var baseLayers = {};


Object.keys(
    BASEMAPS
).forEach(function(key) {

    baseLayers[key] =
        BASEMAPS[key];

});


// ============================================================
// DEFAULT BASEMAP
// ============================================================

BASEMAPS[
    "ESRI Satellite"
].addTo(
    map
);


// ============================================================
// AOI GROUP
// ============================================================

var AOI_LAYER =
    L.layerGroup()
      .addTo(
          map
      );


// ============================================================
// YEAR/AOI-SPECIFIC RASTER GROUPS
// ============================================================
//
// One NDVI group and one mask group for each:
//
// AOI × Year
//
// Example:
//
// ndvi_AOI_001_2016
// mask_AOI_001_2016
//
// ndvi_AOI_002_2016
// mask_AOI_002_2016
//
// etc.
// ============================================================

var YEAR_GROUPS = {};


AOI_NAMES.forEach(
    function(aoiName) {

        YEARS.forEach(
            function(year) {

                YEAR_GROUPS[
                    "ndvi_" +
                    aoiName +
                    "_" +
                    year
                ] =
                    L.layerGroup();


                YEAR_GROUPS[
                    "mask_" +
                    aoiName +
                    "_" +
                    year
                ] =
                    L.layerGroup();

            }
        );

    }
);


// ============================================================
// OVERLAY LAYERS
// ============================================================

var overlayLayers = {

    "AOI Boundaries":
        AOI_LAYER

};


// ============================================================
// ADD NDVI LAYERS
// ============================================================
//
// NDVI layers are organized by AOI and year.
//
// Example:
// AOI_001 — NDVI 2016
// AOI_001 — NDVI 2019
// ...
// AOI_002 — NDVI 2016
// ...
// ============================================================

AOI_NAMES.forEach(
    function(aoiName) {

        YEARS.forEach(
            function(year) {

                overlayLayers[

                    aoiName +
                    " — NDVI " +
                    year

                ] =

                    YEAR_GROUPS[

                        "ndvi_" +
                        aoiName +
                        "_" +
                        year

                    ];

            }
        );

    }
);


// ============================================================
// ADD MANGROVE MASK LAYERS
// ============================================================

AOI_NAMES.forEach(
    function(aoiName) {

        YEARS.forEach(
            function(year) {

                overlayLayers[

                    aoiName +
                    " — Mangrove Mask " +
                    year

                ] =

                    YEAR_GROUPS[

                        "mask_" +
                        aoiName +
                        "_" +
                        year

                    ];

            }
        );

    }
);


// ============================================================
// LAYER CONTROL
// ============================================================

var layerControl =

    L.control.layers(

        baseLayers,

        overlayLayers,

        {

            collapsed:
                false,

            position:
                "topright"

        }

    ).addTo(
        map
    );


// ============================================================
// GLOBAL REFERENCES
// ============================================================

window.AOI_LAYER =
    AOI_LAYER;


window.YEAR_GROUPS =
    YEAR_GROUPS;


window.map =
    map;


window.layerControl =
    layerControl;


console.log(
    "🌿 Mangrove Interactive Map initialized"
);


console.log(
    "Number of AOIs:",
    AOI_NAMES.length
);


console.log(
    "Years:",
    YEARS
);
