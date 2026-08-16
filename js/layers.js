// ============================================================
// LAYER MANAGEMENT - SIMPLIFIED
// ============================================================

console.log('🗺️ Layers module loading...');

// ============================================================
// CHECK REQUIRED LIBRARIES
// ============================================================

if (typeof parseGeoraster !== 'undefined') {
    console.log('✅ GeoRaster loaded');
} else {
    console.error('❌ GeoRaster not loaded');
}

if (typeof GeoRasterLayer !== 'undefined') {
    console.log('✅ GeoRasterLayer loaded');
} else {
    console.error('❌ GeoRasterLayer not loaded');
}

// ============================================================
// COLOR HELPERS
// ============================================================

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

function interpolateColor(color1, color2, factor) {
    var c1 = hexToRgb(color1);
    var c2 = hexToRgb(color2);
    var r = Math.round(c1.r + factor * (c2.r - c1.r));
    var g = Math.round(c1.g + factor * (c2.g - c1.g));
    var b = Math.round(c1.b + factor * (c2.b - c1.b));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// ============================================================
// NDVI COLOR FUNCTION
// ============================================================

function ndviColor(value) {
    if (value === null || value === undefined || isNaN(value) || value <= -9998) {
        return null;
    }

    var min = NDVI_MIN;
    var max = NDVI_MAX;

    if (value <= min) {
        return NDVI_PALETTE.colors[0];
    }

    if (value >= max) {
        return NDVI_PALETTE.colors[NDVI_PALETTE.colors.length - 1];
    }

    var normalized = (value - min) / (max - min);
    var scaled = normalized * (NDVI_PALETTE.colors.length - 1);
    var index = Math.floor(scaled);
    var fraction = scaled - index;

    if (index >= NDVI_PALETTE.colors.length - 1) {
        return NDVI_PALETTE.colors[NDVI_PALETTE.colors.length - 1];
    }

    return interpolateColor(
        NDVI_PALETTE.colors[index],
        NDVI_PALETTE.colors[index + 1],
        fraction
    );
}

// ============================================================
// LOAD AOI GeoJSON
// ============================================================

function loadAOIs() {
    console.log('📂 Loading AOI:', DATA_PATHS.aois);

    fetch(DATA_PATHS.aois)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            console.log('✅ AOI data loaded');

            if (!data.features || data.features.length === 0) {
                console.warn('No features found');
                return;
            }

            var aoiLayer = L.geoJSON(data, {
                style: function() {
                    return AOI_STYLE;
                },
                onEachFeature: function(feature, layer) {
                    var props = feature.properties || {};
                    var name = props.name || props.id || 'AOI';
                    var area = props.area_ha;
                    var ndvi = props.mean_ndvi;

                    var html = '<strong>📍 ' + name + '</strong>';
                    if (area !== undefined && area !== null) {
                        html += '<br>Area: ' + Number(area).toFixed(2) + ' ha';
                    }
                    if (ndvi !== undefined && ndvi !== null) {
                        html += '<br>Mean NDVI: ' + Number(ndvi).toFixed(3);
                    }
                    layer.bindPopup(html);

                    layer.on('mouseover', function() {
                        this.setStyle({ fillOpacity: 0.30, weight: 5 });
                        this.bringToFront();
                    });
                    layer.on('mouseout', function() {
                        this.setStyle({ fillOpacity: AOI_STYLE.fillOpacity, weight: AOI_STYLE.weight });
                    });
                }
            });

            AOI_LAYER.clearLayers();
            AOI_LAYER.addLayer(aoiLayer);

            var bounds = aoiLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [40, 40] });
            }
            window.AOI_BOUNDS = bounds;

            console.log('✅ AOIs loaded successfully');
        })
        .catch(function(error) {
            console.error('❌ AOI loading error:', error);
        });
}

// ============================================================
// LOAD GEOTIFF RASTER
// ============================================================

function loadGeoTIFF(url, options) {
    console.log('📂 Loading:', url);

    return fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status + ': ' + url);
            }
            return response.arrayBuffer();
        })
        .then(function(arrayBuffer) {
            return parseGeoraster(arrayBuffer);
        })
        .then(function(georaster) {
            var layer = new GeoRasterLayer({
                georaster: georaster,
                opacity: options.opacity || 0.8,
                resolution: 128,
                pixelValuesToColorFn: options.pixelValuesToColorFn
            });
            return layer;
        });
}

// ============================================================
// LOAD NDVI LAYER
// ============================================================

function loadNDVILayer(year, raw) {
    console.log('📂 Loading NDVI for:', year, raw ? '(raw)' : '');

    var path;
    var group;

    if (raw) {
        path = DATA_PATHS.ndviRaw[year];
        group = YEAR_GROUPS['ndvi_raw_' + year];
    } else {
        path = DATA_PATHS.ndvi[year];
        group = YEAR_GROUPS['ndvi_' + year];
    }

    if (!path) {
        console.warn('No path for:', year);
        return;
    }

    if (group._loading) {
        console.log('Already loading:', year);
        return;
    }

    group._loading = true;

    loadGeoTIFF(
        path,
        {
            opacity: raw ? RASTER_OPTIONS.rawNdviOpacity : RASTER_OPTIONS.ndviOpacity,
            pixelValuesToColorFn: function(values) {
                return ndviColor(values[0]);
            }
        }
    )
    .then(function(layer) {
        group.addLayer(layer);
        group._loading = false;
        console.log('✅ NDVI loaded:', year, raw ? '(raw)' : '');
    })
    .catch(function(error) {
        group._loading = false;
        console.error('❌ NDVI failed:', year, error.message);
    });
}

// ============================================================
// LOAD MASK LAYER
// ============================================================

function loadMaskLayer(year) {
    console.log('📂 Loading mask for:', year);

    var path = DATA_PATHS.masks[year];
    var group = YEAR_GROUPS['mask_' + year];

    if (!path) {
        console.warn('No mask path for:', year);
        return;
    }

    if (group._loading) {
        console.log('Already loading mask:', year);
        return;
    }

    group._loading = true;

    loadGeoTIFF(
        path,
        {
            opacity: MASK_OPACITY,
            pixelValuesToColorFn: function(values) {
                var value = values[0];
                if (value === null || value === undefined || isNaN(value) || value === 0) {
                    return null;
                }
                return MASK_COLOR;
            }
        }
    )
    .then(function(layer) {
        group.addLayer(layer);
        group._loading = false;
        console.log('✅ Mask loaded:', year);
    })
    .catch(function(error) {
        group._loading = false;
        console.error('❌ Mask failed:', year, error.message);
    });
}

// ============================================================
// LOAD ALL RASTERS ON DEMAND
// ============================================================

function loadRasterOnDemand(event) {
    var layer = event.layer;

    YEARS.forEach(function(year) {
        if (layer === YEAR_GROUPS['ndvi_' + year]) {
            loadNDVILayer(year, false);
        }
        if (layer === YEAR_GROUPS['ndvi_raw_' + year]) {
            loadNDVILayer(year, true);
        }
        if (layer === YEAR_GROUPS['mask_' + year]) {
            loadMaskLayer(year);
        }
    });
}

// Listen for layer activation
map.on('overlayadd', loadRasterOnDemand);

// ============================================================
// INITIALIZATION
// ============================================================

function initializeLayers() {
    loadAOIs();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayers);
} else {
    initializeLayers();
}

console.log('🗺️ Layers module ready');
