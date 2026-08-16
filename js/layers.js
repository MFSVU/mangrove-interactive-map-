// ============================================================
// GENERIC GEOTIFF LOADER
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


            var layer =
                new GeoRasterLayer({

                    georaster:
                        georaster,

                    opacity:
                        options.opacity ||
                        0.8,

                    resolution:
                        options.resolution ||
                        RASTER_OPTIONS.resolution,

                    pixelValuesToColorFn:
                        options.pixelValuesToColorFn,

                    // Important for displaying raster
                    // above satellite basemaps.
                    zIndex:
                        options.zIndex || 100

                });


            // ------------------------------------------------
            // Force raster above basemap
            // ------------------------------------------------

            if (
                layer.setZIndex
            ) {

                layer.setZIndex(
                    options.zIndex || 100
                );

            }


            return layer;

        });

}
