// ============================================================
// RASTER AND AOI LAYER MANAGEMENT
// ============================================================


// ============================================================
// CHECK REQUIRED LIBRARIES
// ============================================================

console.log(
    "Checking raster libraries..."
);


if (
    typeof parseGeoraster !== "undefined"
) {

    console.log(
        "✅ GeoRaster loaded"
    );

} else {

    console.error(
        "❌ GeoRaster not loaded"
    );

}


if (
    typeof GeoRasterLayer !== "undefined"
) {

    console.log(
        "✅ GeoRasterLayer loaded"
    );

} else {

    console.error(
        "❌ GeoRasterLayer not loaded"
    );

}


// ============================================================
// COLOR CONVERSION
// ============================================================

function hexToRgb(hex) {

    hex =
        hex.replace(
            "#",
            ""
        );


    return {

        r:
            parseInt(
                hex.substring(0, 2),
                16
            ),

        g:
            parseInt(
                hex.substring(2, 4),
                16
            ),

        b:
            parseInt(
                hex.substring(4, 6),
                16
            )

    };

}


// ============================================================
// COLOR INTERPOLATION
// ============================================================

function interpolateColor(
    color1,
    color2,
    factor
) {

    var c1 =
        hexToRgb(color1);

    var c2 =
        hexToRgb(color2);


    var r =
        Math.round(
            c1.r +
            factor *
            (c2.r - c1.r)
        );


    var g =
        Math.round(
            c1.g +
            factor *
            (c2.g - c1.g)
        );


    var b =
        Math.round(
            c1.b +
            factor *
            (c2.b - c1.b)
        );


    return (
        "rgb(" +
        r +
        "," +
        g +
        "," +
        b +
        ")"
    );

}


// ============================================================
// NDVI COLOR FUNCTION
// ============================================================
//
// NDVI:
//
// -1.0 -> RED
//  0.0 -> WHITE
// +1.0 -> GREEN
//
// ============================================================

function ndviColor(value) {

    // --------------------------------------------------------
    // NoData
    // --------------------------------------------------------

    if (
        value === null ||
        value === undefined ||
        isNaN(value) ||
        value <= -9998
    ) {

        return null;

    }


    // --------------------------------------------------------
    // NDVI limits
    // --------------------------------------------------------

    var min =
        NDVI_MIN;

    var max =
        NDVI_MAX;


    // --------------------------------------------------------
    // Clamp values
    // --------------------------------------------------------

    if (value < min) {

        value =
            min;

    }


    if (value > max) {

        value =
            max;

    }


    // --------------------------------------------------------
    // Normalize
    // --------------------------------------------------------

    var normalized =
        (value - min) /
        (max - min);


    var colors =
        NDVI_PALETTE.colors;


    var scaled =
        normalized *
        (colors.length - 1);


    var index =
        Math.floor(
            scaled
        );


    var fraction =
        scaled -
        index;


    // --------------------------------------------------------
    // Maximum value
    // --------------------------------------------------------

    if (
        index >=
        colors.length - 1
    ) {

        return colors[
            colors.length - 1
        ];

    }


    // --------------------------------------------------------
    // Interpolate
    // --------------------------------------------------------

    return interpolateColor(

        colors[index],

        colors[index + 1],

        fraction

    );

}


// ============================================================
// GET AOI COLOR
// ============================================================

function getAoiColor(index) {

    return AOI_COLORS[
        index %
        AOI_COLORS.length
    ];

}


// ============================================================
// LOAD GEOJSON AOIs
// ============================================================

function loadAOIs() {

    console.log(
        "Loading AOIs:",
        DATA_PATHS.aois
    );


    fetch(
        DATA_PATHS.aois
    )

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "AOI HTTP error: " +
                    response.status
                );

            }


            return response.json();

        })


        .then(function(data) {

            console.log(
                "AOI GeoJSON loaded"
            );


            if (
                !data.features ||
                data.features.length === 0
            ) {

                console.warn(
                    "No AOI features found"
                );

                return;

            }


            console.log(
                "Number of AOIs in GeoJSON:",
                data.features.length
            );


            // ------------------------------------------------
            // CREATE AOI LAYER
            // ------------------------------------------------

            var aoiLayer =
                L.geoJSON(

                    data,

                    {

                        // ------------------------------------
                        // AOI style
                        // ------------------------------------

                        style:
                            function(feature) {

                                var props =
                                    feature.properties ||
                                    {};


                                var name =
                                    props.name ||
                                    props.id ||
                                    "AOI";


                                var index =
                                    AOI_NAMES.indexOf(
                                        name
                                    );


                                if (
                                    index < 0
                                ) {

                                    index =
                                        0;

                                }


                                var color =
                                    getAoiColor(
                                        index
                                    );


                                return {

                                    color:
                                        color,

                                    weight:
                                        AOI_STYLE.weight,

                                    opacity:
                                        AOI_STYLE.opacity,

                                    fillColor:
                                        color,

                                    fillOpacity:
                                        AOI_STYLE.fillOpacity

                                };

                            },


                        // ------------------------------------
                        // AOI interaction
                        // ------------------------------------

                        onEachFeature:
                            function(
                                feature,
                                layer
                            ) {

                                var props =
                                    feature.properties ||
                                    {};


                                var name =
                                    props.name ||
                                    props.id ||
                                    "AOI";


                                var area =
                                    props.area_ha;


                                var ndvi =
                                    props.mean_ndvi;


                                var html =
                                    "<strong>📍 " +
                                    name +
                                    "</strong>";


                                if (
                                    area !==
                                    undefined &&
                                    area !==
                                    null
                                ) {

                                    html +=
                                        "<br>Area: " +
                                        Number(
                                            area
                                        ).toFixed(2) +
                                        " ha";

                                }


                                if (
                                    ndvi !==
                                    undefined &&
                                    ndvi !==
                                    null
                                ) {

                                    html +=
                                        "<br>Mean NDVI: " +
                                        Number(
                                            ndvi
                                        ).toFixed(3);

                                }


                                layer.bindPopup(
                                    html
                                );


                                // ----------------------------
                                // Mouse over
                                // ----------------------------

                                layer.on(
                                    "mouseover",
                                    function() {

                                        this.setStyle({

                                            fillOpacity:
                                                0.30,

                                            weight:
                                                5

                                        });


                                        this.bringToFront();

                                    }
                                );


                                // ----------------------------
                                // Mouse out
                                // ----------------------------

                                layer.on(
                                    "mouseout",
                                    function() {

                                        var index =
                                            AOI_NAMES.indexOf(
                                                name
                                            );


                                        if (
                                            index < 0
                                        ) {

                                            index =
                                                0;

                                        }


                                        var color =
                                            getAoiColor(
                                                index
                                            );


                                        this.setStyle({

                                            color:
                                                color,

                                            fillColor:
                                                color,

                                            fillOpacity:
                                                AOI_STYLE.fillOpacity,

                                            weight:
                                                AOI_STYLE.weight

                                        });

                                    }
                                );

                            }

                    }

                );


            // ------------------------------------------------
            // ADD AOI LAYER
            // ------------------------------------------------

            AOI_LAYER.clearLayers();


            AOI_LAYER.addLayer(
                aoiLayer
            );


            // ------------------------------------------------
            // FIT MAP TO AOIs
            // ------------------------------------------------

            var bounds =
                aoiLayer.getBounds();


            if (
                bounds.isValid()
            ) {

                map.fitBounds(

                    bounds,

                    {

                        padding:
                            [40, 40]

                    }

                );

            }


            window.AOI_BOUNDS =
                bounds;


            console.log(
                "✅ All AOIs loaded"
            );

        })


        .catch(function(error) {

            console.error(
                "❌ AOI loading error:",
                error
            );

        });

}


// ============================================================
// GENERIC GEOTIFF LOADER
// ============================================================
//
// zIndex is explicitly specified.
//
// NDVI:
//   zIndex = 200
//
// Mangrove mask:
//   zIndex = 300
//
// ============================================================

function loadGeoTIFF(
    url,
    options
) {

    console.log(
        "Loading GeoTIFF:",
        url
    );


    return fetch(
        url
    )

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "GeoTIFF HTTP error " +
                    response.status +
                    ": " +
                    url
                );

            }


            return response.arrayBuffer();

        })


        .then(function(arrayBuffer) {

            return parseGeoraster(
                arrayBuffer
            );

        })


        .then(function(georaster) {

            console.log(
                "GeoTIFF parsed:",
                url
            );


            // ------------------------------------------------
            // CREATE GEORASTER LAYER
            // ------------------------------------------------

            var layer =
                new GeoRasterLayer({

                    georaster:
                        georaster,

                    // 100% opacity
                    opacity:
                        options.opacity !== undefined
                            ? options.opacity
                            : 1.0,

                    resolution:
                        options.resolution ||
                        RASTER_OPTIONS.resolution,

                    pixelValuesToColorFn:
                        options.pixelValuesToColorFn,

                    zIndex:
                        options.zIndex !== undefined
                            ? options.zIndex
                            : 100

                });


            // ------------------------------------------------
            // EXPLICITLY SET Z-INDEX
            // ------------------------------------------------

            if (
                typeof layer.setZIndex ===
                "function"
            ) {

                layer.setZIndex(
                    options.zIndex !== undefined
                        ? options.zIndex
                        : 100
                );

            }


            return layer;

        });

}


// ============================================================
// CREATE NDVI PATH
// ============================================================

function getNDVIPath(
    aoiName,
    year
) {

    return (

        DATA_PATHS.ndviFolder +

        aoiName +

        "_ndvi_" +

        year +

        ".tif"

    );

}


// ============================================================
// CREATE MASK PATH
// ============================================================

function getMaskPath(
    aoiName,
    year
) {

    return (

        DATA_PATHS.maskFolder +

        aoiName +

        "_mask_" +

        year +

        ".tif"

    );

}


// ============================================================
// LOAD NDVI LAYER
// ============================================================
//
// There is ONLY ONE NDVI raster per AOI/year.
//
// Raw NDVI is NOT used.
// ============================================================

function loadNDVILayer(
    aoiName,
    year
) {

    var path =
        getNDVIPath(
            aoiName,
            year
        );


    var groupKey =
        "ndvi_" +
        aoiName +
        "_" +
        year;


    var group =
        YEAR_GROUPS[
            groupKey
        ];


    if (!group) {

        console.warn(
            "NDVI layer group not found:",
            groupKey
        );

        return;

    }


    // --------------------------------------------------------
    // Prevent duplicate loading
    // --------------------------------------------------------

    if (
        group._rasterLoaded
    ) {

        return;

    }


    group._rasterLoaded =
        true;


    // --------------------------------------------------------
    // LOAD NDVI GEOTIFF
    // --------------------------------------------------------

    loadGeoTIFF(

        path,

        {

            // ----------------------------------------------
            // NDVI opacity = 100%
            // ----------------------------------------------

            opacity:
                1.0,


            // ----------------------------------------------
            // Raster resolution
            // ----------------------------------------------

            resolution:
                RASTER_OPTIONS.resolution,


            // ----------------------------------------------
            // NDVI above basemap
            // ----------------------------------------------

            zIndex:
                200,


            // ----------------------------------------------
            // NDVI color rendering
            // ----------------------------------------------

            pixelValuesToColorFn:
                function(values) {

                    return ndviColor(
                        values[0]
                    );

                }

        }

    )

        .then(function(layer) {

            // ----------------------------------------------
            // Add raster to group
            // ----------------------------------------------

            group.addLayer(
                layer
            );


            // ----------------------------------------------
            // Explicitly bring raster above basemap
            // ----------------------------------------------

            if (
                typeof layer.bringToFront ===
                "function"
            ) {

                layer.bringToFront();

            }


            console.log(
                "✅ NDVI loaded:",
                aoiName,
                year
            );

        })


        .catch(function(error) {

            group._rasterLoaded =
                false;


            console.error(
                "❌ NDVI loading failed:",
                aoiName,
                year,
                error
            );

        });

}


// ============================================================
// LOAD MANGROVE MASK
// ============================================================
//
// Mangrove masks are binary:
//
// 0 = No mangrove
// 1 = Mangrove
//
// Only pixels with value > 0 are displayed.
// ============================================================

function loadMaskLayer(
    aoiName,
    year
) {

    var path =
        getMaskPath(
            aoiName,
            year
        );


    var groupKey =
        "mask_" +
        aoiName +
        "_" +
        year;


    var group =
        YEAR_GROUPS[
            groupKey
        ];


    if (!group) {

        console.warn(
            "Mask layer group not found:",
            groupKey
        );

        return;

    }


    // --------------------------------------------------------
    // Prevent duplicate loading
    // --------------------------------------------------------

    if (
        group._rasterLoaded
    ) {

        return;

    }


    group._rasterLoaded =
        true;


    // --------------------------------------------------------
    // LOAD MASK
    // --------------------------------------------------------

    loadGeoTIFF(

        path,

        {

            // ----------------------------------------------
            // Mask opacity = 100%
            // ----------------------------------------------

            opacity:
                1.0,


            // ----------------------------------------------
            // Raster resolution
            // ----------------------------------------------

            resolution:
                RASTER_OPTIONS.resolution,


            // ----------------------------------------------
            // Mask above NDVI
            // ----------------------------------------------

            zIndex:
                300,


            // ----------------------------------------------
            // Mask color
            // ----------------------------------------------

            pixelValuesToColorFn:
                function(values) {

                    var value =
                        values[0];


                    // NoData / background

                    if (
                        value === null ||
                        value === undefined ||
                        isNaN(value) ||
                        value === 0
                    ) {

                        return null;

                    }


                    return MASK_COLOR;

                }

        }

    )

        .then(function(layer) {

            // ----------------------------------------------
            // Add mask
            // ----------------------------------------------

            group.addLayer(
                layer
            );


            // ----------------------------------------------
            // Bring mask above NDVI
            // ----------------------------------------------

            if (
                typeof layer.bringToFront ===
                "function"
            ) {

                layer.bringToFront();

            }


            console.log(
                "✅ Mask loaded:",
                aoiName,
                year
            );

        })


        .catch(function(error) {

            group._rasterLoaded =
                false;


            console.error(
                "❌ Mask loading failed:",
                aoiName,
                year,
                error
            );

        });

}


// ============================================================
// INITIALIZE RASTER LAYERS
// ============================================================
//
// Raster files are loaded on demand when activated.
// ============================================================

function initializeRasterLayers() {

    console.log(
        "Raster layers available for:",
        AOI_NAMES.length,
        "AOIs"
    );


    console.log(
        "Raster loading mode: on-demand"
    );


    console.log(
        "NDVI range:",
        NDVI_MIN,
        "to",
        NDVI_MAX
    );

}


// ============================================================
// LAYER CONTROL EVENTS
// ============================================================

map.on(
    "overlayadd",
    function(event) {

        AOI_NAMES.forEach(
            function(aoiName) {

                YEARS.forEach(
                    function(year) {

                        var ndviKey =
                            "ndvi_" +
                            aoiName +
                            "_" +
                            year;


                        var maskKey =
                            "mask_" +
                            aoiName +
                            "_" +
                            year;


                        // ------------------------------------
                        // NDVI
                        // ------------------------------------

                        if (
                            event.layer ===
                            YEAR_GROUPS[
                                ndviKey
                            ]
                        ) {

                            loadNDVILayer(
                                aoiName,
                                year
                            );

                        }


                        // ------------------------------------
                        // Mask
                        // ------------------------------------

                        if (
                            event.layer ===
                            YEAR_GROUPS[
                                maskKey
                            ]
                        ) {

                            loadMaskLayer(
                                aoiName,
                                year
                            );

                        }

                    }
                );

            }
        );

    }
);


// ============================================================
// INITIALIZATION
// ============================================================

function initializeLayers() {

    loadAOIs();

    initializeRasterLayers();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeLayers
    );

} else {

    initializeLayers();

}


console.log(
    "🗺️ Layers module loaded"
);
