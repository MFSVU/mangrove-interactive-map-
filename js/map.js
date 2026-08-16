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
// RASTER GROUPS
// ============================================================
//
// For every AOI/year combination:
//
// NDVI:
//   ndvi_AOI_001_2016
//
// Mask:
//   mask_AOI_001_2016
//
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
// GROUPED OVERLAY LAYERS
// ============================================================

var groupedOverlays = {};


// ============================================================
// AOI BOUNDARY GROUP
// ============================================================

groupedOverlays[
    "AOI Boundaries"
] = {

    "All AOI Boundaries":
        AOI_LAYER

};


// ============================================================
// CREATE AOI-SPECIFIC GROUPS
// ============================================================
//
// Each AOI is a collapsible group.
//
// Example:
//
// AOI_001
//     NDVI 2016
//     NDVI 2019
//     NDVI 2022
//     NDVI 2025
//     Mangrove Mask 2016
//     Mangrove Mask 2019
//     Mangrove Mask 2022
//     Mangrove Mask 2025
//
// ============================================================

AOI_NAMES.forEach(
    function(aoiName) {

        var aoiGroup = {};


        // ----------------------------------------------------
        // NDVI layers
        // ----------------------------------------------------

        YEARS.forEach(
            function(year) {

                aoiGroup[
                    "NDVI " + year
                ] =

                    YEAR_GROUPS[
                        "ndvi_" +
                        aoiName +
                        "_" +
                        year
                    ];

            }
        );


        // ----------------------------------------------------
        // Mangrove Mask layers
        // ----------------------------------------------------

        YEARS.forEach(
            function(year) {

                aoiGroup[
                    "Mangrove Mask " + year
                ] =

                    YEAR_GROUPS[
                        "mask_" +
                        aoiName +
                        "_" +
                        year
                    ];

            }
        );


        // ----------------------------------------------------
        // Add AOI group
        // ----------------------------------------------------

        groupedOverlays[
            aoiName
        ] =
            aoiGroup;

    }
);


// ============================================================
// GROUPED LAYER CONTROL
// ============================================================
//
// Requires:
// leaflet-groupedlayercontrol
//
// This creates:
//
// AOI_001
// AOI_002
// AOI_003
// ...
//
// Each AOI can be expanded/collapsed.
// ============================================================

var layerControl =

    L.control.groupedLayers(

        baseLayers,

        groupedOverlays,

        {

            collapsed:
                false,

            position:
                "topright",

            groupCheckboxes:
                false

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
