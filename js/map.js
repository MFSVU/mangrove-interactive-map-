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
//
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
// IMPORTANT: ENABLE MOUSE-WHEEL SCROLLING
// INSIDE THE LAYER CONTROL
// ============================================================
//
// By default, Leaflet can allow wheel events over a control
// to propagate to the map. This causes the map to zoom when
// the mouse is over the long AOI list.
//
// These two Leaflet functions stop the control's mouse events
// from propagating to the map while preserving normal map
// zooming everywhere else.
//
// ============================================================

var layerControlContainer =
    layerControl.getContainer();


if (
    layerControlContainer
) {

    // Prevent clicks and other control events
    // from interacting with the map.

    L.DomEvent.disableClickPropagation(
        layerControlContainer
    );


    // Prevent mouse-wheel events from reaching
    // the map.

    L.DomEvent.disableScrollPropagation(
        layerControlContainer
    );


    // Explicitly ensure the control itself can scroll.

    layerControlContainer.style.overflowY =
        "auto";

    layerControlContainer.style.overflowX =
        "hidden";

}


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


// ============================================================
// INITIALIZATION MESSAGE
// ============================================================

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


console.log(
    "✅ Layer-control mouse-wheel scrolling enabled"
);






// ============================================================
// MODAL CONTROLS - Open Images
// ============================================================

// Get elements
var btnStudyArea = document.getElementById('btnStudyArea');
var btnNDVI = document.getElementById('btnNDVI');
var btnMask = document.getElementById('btnMask');

var modalStudyArea = document.getElementById('modalStudyArea');
var modalNDVI = document.getElementById('modalNDVI');
var modalMask = document.getElementById('modalMask');

var closeStudyArea = document.getElementById('closeStudyArea');
var closeNDVI = document.getElementById('closeNDVI');
var closeMask = document.getElementById('closeMask');

// Open modals
btnStudyArea.addEventListener('click', function() {
    modalStudyArea.classList.add('show');
});

btnNDVI.addEventListener('click', function() {
    modalNDVI.classList.add('show');
});

btnMask.addEventListener('click', function() {
    modalMask.classList.add('show');
});

// Close modals (X button)
closeStudyArea.addEventListener('click', function() {
    modalStudyArea.classList.remove('show');
});

closeNDVI.addEventListener('click', function() {
    modalNDVI.classList.remove('show');
});

closeMask.addEventListener('click', function() {
    modalMask.classList.remove('show');
});

// Close modals by clicking outside the image
window.addEventListener('click', function(event) {
    if (event.target === modalStudyArea) {
        modalStudyArea.classList.remove('show');
    }
    if (event.target === modalNDVI) {
        modalNDVI.classList.remove('show');
    }
    if (event.target === modalMask) {
        modalMask.classList.remove('show');
    }
});

// Close modals with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        modalStudyArea.classList.remove('show');
        modalNDVI.classList.remove('show');
        modalMask.classList.remove('show');
    }
});

console.log('✅ Image buttons initialized');


