// ============================================================
// RASTER AND AOI LAYER MANAGEMENT
// ============================================================


// ============================================================
// CHECK REQUIRED LIBRARIES
// ============================================================

console.log(
    'Checking raster libraries...'
);


if (
    typeof parseGeoraster !==
    'undefined'
) {

    console.log(
        '✅ GeoRaster loaded'
    );

} else {

    console.error(
        '❌ GeoRaster not loaded'
    );

}


if (
    typeof GeoRasterLayer !==
    'undefined'
) {

    console.log(
        '✅ GeoRasterLayer loaded'
    );

} else {

    console.error(
        '❌ GeoRasterLayer not loaded'
    );

}


// ============================================================
// COLOR CONVERSION
// ============================================================

function hexToRgb(hex) {

    hex =
        hex.replace('#', '');

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
        'rgb(' +
        r + ',' +
        g + ',' +
        b +
        ')'
    );

}


// ============================================================
// NDVI COLOR FUNCTION
// ============================================================
//
// NDVI:
// -1 → 0  = RED
//  0 → 1  = GREEN
//
// Zero is approximately white/light transition.
//
// ============================================================

function ndviColor(value) {

    if (
        value === null ||
        value === undefined ||
        isNaN(value) ||
        value <= -9998
    ) {

        return null;

    }


    var min =
        NDVI_MIN;

    var max =
        NDVI_MAX;


    // Below -1

    if (value <= min) {

        return NDVI_PALETTE.colors[0];

    }


    // Above 1

    if (value >= max) {

        return NDVI_PALETTE.colors[
            NDVI_PALETTE.colors.length - 1
        ];

    }


    // Normalize

    var normalized =
        (value - min) /
        (max - min);


    var scaled =
        normalized *
        (NDVI_PALETTE.colors.length - 1);


    var index =
        Math.floor(scaled);


    var fraction =
        scaled - index;


    if (
        index >=
        NDVI_PALETTE.colors.length - 1
    ) {

        return NDVI_PALETTE.colors[
            NDVI_PALETTE.colors.length - 1
        ];

    }


    return interpolateColor(

        NDVI_PALETTE.colors[index],

        NDVI_PALETTE.colors[
            index + 1
        ],

        fraction

    );

}


// ============================================================
// LOAD GEOJSON AOIs
// ============================================================

function loadAOIs() {

    console.log(
        'Loading AOIs:',
        DATA_PATHS.aois
    );


    fetch(
        DATA_PATHS.aois
    )

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    'AOI HTTP error: ' +
                    response.status
                );

            }

            return response.json();

        })

        .then(function(data) {

            console.log(
                'AOI data loaded:',
                data
            );


            if (
                !data.features ||
                data.features.length === 0
            ) {

                console.warn(
                    'No AOI features found'
                );

                return;

            }


            // ------------------------------------------------
            // Create GeoJSON layer
            // ------------------------------------------------

            var aoiLayer =
                L.geoJSON(

                    data,

                    {

                        style:
                            function(feature) {

                                return AOI_STYLE;

                            },


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
                                    'AOI';


                                var html =
                                    '<strong>📍 ' +
                                    name +
                                    '</strong>';


                                if (
                                    props.area_ha !==
                                    undefined &&
                                    props.area_ha !==
                                    null
                                ) {

                                    html +=
                                        '<br>Area: ' +
                                        Number(
                                            props.area_ha
                                        ).toFixed(2) +
                                        ' ha';

                                }


                                if (
                                    props.mean_ndvi !==
                                    undefined &&
                                    props.mean_ndvi !==
                                    null
                                ) {

                                    html +=
                                        '<br>Mean NDVI: ' +
                                        Number(
                                            props.mean_ndvi
                                        ).toFixed(3);

                                }


                                layer.bindPopup(
                                    html
                                );


                                layer.on(
                                    'mouseover',
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


                                layer.on(
                                    'mouseout',
                                    function() {

                                        this.setStyle({

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
            // Add AOIs to map
            // ------------------------------------------------

            AOI_LAYER.clearLayers();

            AOI_LAYER.addLayer(
                aoiLayer
            );


            // ------------------------------------------------
            // Fit map
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
                '✅ AOIs loaded'
            );

        })

        .catch(function(error) {

            console.error(
                '❌ AOI loading error:',
                error
            );

        });

}


// ============================================================
// GENERIC GEOTIFF LOADER
// ============================================================

function loadGeoTIFF(
    url,
    options
) {

    console.log(
        'Loading GeoTIFF:',
        url
    );


    return fetch(url)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    'GeoTIFF HTTP error ' +
                    response.status +
                    ': ' +
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

            var layer =
                new GeoRasterLayer({

                    georaster:
                        georaster,

                    // ----------------------------------------
                    // 100% opacity
                    // ----------------------------------------

                    opacity:
                        options.opacity,

                    resolution:
                        RASTER_OPTIONS.resolution,

                    pixelValuesToColorFn:
                        options.pixelValuesToColorFn

                });


            return layer;

        });

}


// ============================================================
// LOAD NDVI LAYER
// ============================================================

function loadNDVILayer(
    aoi,
    year
) {

    var path =
        DATA_PATHS
            .ndvi[aoi][year];


    var group =
        AOI_GROUPS
            [aoi]
            .ndvi[year];


    if (!path) {

        console.warn(
            'No NDVI path:',
            aoi,
            year
        );

        return;

    }


    if (
        group._rasterLoaded
    ) {

        return;

    }


    group._rasterLoaded =
        true;


    loadGeoTIFF(

        path,

        {

            // --------------------------------------------
            // 100% opacity
            // --------------------------------------------

            opacity:
                1.0,


            // --------------------------------------------
            // NDVI rendering
            // --------------------------------------------

            pixelValuesToColorFn:
                function(values) {

                    return ndviColor(
                        values[0]
                    );

                }

        }

    )

        .then(function(layer) {

            group.addLayer(
                layer
            );


            console.log(
                '✅ NDVI loaded:',
                aoi,
                year
            );

        })

        .catch(function(error) {

            group._rasterLoaded =
                false;

            console.error(
                '❌ NDVI loading failed:',
                aoi,
                year,
                error
            );

        });

}


// ============================================================
// LOAD MANGROVE MASK
// ============================================================

function loadMaskLayer(
    aoi,
    year
) {

    var path =
        DATA_PATHS
            .masks[aoi][year];


    var group =
        AOI_GROUPS
            [aoi]
            .mask[year];


    if (!path) {

        console.warn(
            'No mask path:',
            aoi,
            year
        );

        return;

    }


    if (
        group._rasterLoaded
    ) {

        return;

    }


    group._rasterLoaded =
        true;


    loadGeoTIFF(

        path,

        {

            // --------------------------------------------
            // 100% opacity
            // --------------------------------------------

            opacity:
                1.0,


            // --------------------------------------------
            // Mask color
            // --------------------------------------------

            pixelValuesToColorFn:
                function(values) {

                    var value =
                        values[0];


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

            group.addLayer(
                layer
            );


            console.log(
                '✅ Mask loaded:',
                aoi,
                year
            );

        })

        .catch(function(error) {

            group._rasterLoaded =
                false;

            console.error(
                '❌ Mask loading failed:',
                aoi,
                year,
                error
            );

        });

}


// ============================================================
// LOAD ALL RASTERS
// ============================================================

function initializeRasterLayers() {

    AOI_NAMES.forEach(
        function(aoi) {

            YEARS.forEach(
                function(year) {

                    loadNDVILayer(
                        aoi,
                        year
                    );

                    loadMaskLayer(
                        aoi,
                        year
                    );

                }
            );

        }
    );

}


// ============================================================
// AOI GROUP CONTROL
// ============================================================
//
// Clicking:
//
// AOI_001 — All layers
//
// activates/deactivates all NDVI + Mask layers
// belonging to AOI_001.
//
// ============================================================

function setAOIGroupVisibility(
    aoi,
    visible
) {

    var group =
        AOI_GROUPS[aoi];


    if (!group) {

        return;

    }


    YEARS.forEach(
        function(year) {

            var ndviGroup =
                group.ndvi[year];

            var maskGroup =
                group.mask[year];


            if (visible) {

                if (
                    !map.hasLayer(
                        ndviGroup
                    )
                ) {

                    map.addLayer(
                        ndviGroup
                    );

                }


                if (
                    !map.hasLayer(
                        maskGroup
                    )
                ) {

                    map.addLayer(
                        maskGroup
                    );

                }

            } else {

                if (
                    map.hasLayer(
                        ndviGroup
                    )
                ) {

                    map.removeLayer(
                        ndviGroup
                    );

                }


                if (
                    map.hasLayer(
                        maskGroup
                    )
                ) {

                    map.removeLayer(
                        maskGroup
                    );

                }

            }

        }
    );

}


// ============================================================
// LAYER CONTROL EVENTS
// ============================================================

map.on(
    'overlayadd',
    function(event) {

        AOI_NAMES.forEach(
            function(aoi) {

                var group =
                    AOI_GROUPS[aoi];


                // --------------------------------------------
                // AOI "ALL LAYERS"
                // --------------------------------------------

                if (
                    event.layer ===
                    group.all
                ) {

                    setAOIGroupVisibility(
                        aoi,
                        true
                    );

                }


                // --------------------------------------------
                // NDVI
                // --------------------------------------------

                YEARS.forEach(
                    function(year) {

                        if (
                            event.layer ===
                            group.ndvi[year]
                        ) {

                            loadNDVILayer(
                                aoi,
                                year
                            );

                        }


                        // ------------------------------------
                        // MASK
                        // ------------------------------------

                        if (
                            event.layer ===
                            group.mask[year]
                        ) {

                            loadMaskLayer(
                                aoi,
                                year
                            );

                        }

                    }
                );

            }
        );

    }
);


map.on(
    'overlayremove',
    function(event) {

        AOI_NAMES.forEach(
            function(aoi) {

                var group =
                    AOI_GROUPS[aoi];


                if (
                    event.layer ===
                    group.all
                ) {

                    setAOIGroupVisibility(
                        aoi,
                        false
                    );

                }

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
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initializeLayers
    );

} else {

    initializeLayers();

}


console.log(
    '🗺️ Layers module loaded'
);
