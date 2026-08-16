// ============================================================
// RASTER AND AOI LAYER MANAGEMENT - FULLY FIXED
// ============================================================

// ============================================================
// CHECK REQUIRED LIBRARIES
// ============================================================

console.log('Checking raster libraries...');

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
// COLOR INTERPOLATION
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
// LOAD GEOJSON AOIs
// ============================================================

function loadAOIs() {
    console.log('📂 Loading AOI:', DATA_PATHS.aois);

    fetch(DATA_PATHS.aois)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('AOI HTTP error: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            console.log('✅ AOI data loaded');

            if (!data.features || data.features.length === 0) {
                console.warn('No AOI features found');
                return;
            }

            var aoiLayer = L.geoJSON(data, {
                style: function(feature) {
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
                        this.setStyle({
                            fillOpacity: 0.30,
                            weight: 5
                        });
                        this.bringToFront();
                    });

                    layer.on('mouseout', function() {
                        this.setStyle({
                            fillOpacity: AOI_STYLE.fillOpacity,
                            weight: AOI_STYLE.weight
                        });
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
            console.log('✅ AOIs loaded');
        })
        .catch(function(error) {
            console.error('❌ AOI loading error:', error);
        });
}

// ============================================================
// GENERIC GEOTIFF LOADER - FULLY FIXED
// ============================================================

function loadGeoTIFF(url, options) {
    console.log('📂 Loading GeoTIFF:', url);

    return fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('GeoTIFF HTTP error ' + response.status + ': ' + url);
            }
            return response.arrayBuffer();
        })
        .then(function(arrayBuffer) {
            return parseGeoraster(arrayBuffer);
        })
        .then(function(georaster) {
            // Get bounds for positioning
            var bounds = georaster.getBoundingBox();
            console.log('📐 GeoTIFF bounds:', bounds);
            
            var layer = new GeoRasterLayer({
                georaster: georaster,
                opacity: options.opacity || 0.85,
                resolution: 128,
                background: 'rgba(0,0,0,0)',
                bounds: bounds,
                pixelValuesToColorFn: options.pixelValuesToColorFn
            });
            
            // Ensure layer stays on top
            layer.on('add', function() {
                console.log('✅ Layer added to map');
                try {
                    this.bringToFront();
                } catch(e) {
                    // Ignore if method doesn't exist
                }
            });
            
            return layer;
        })
        .catch(function(error) {
            console.error('❌ Failed to load:', url, error);
            throw error;
        });
}

// ============================================================
// LOAD NDVI LAYER
// ============================================================

function loadNDVILayer(year, raw) {
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
        console.warn('No NDVI path for:', year);
        return;
    }

    if (group._rasterLoaded) {
        console.log('Already loaded NDVI:', year, raw ? '(raw)' : '');
        return;
    }

    group._rasterLoaded = true;

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
        
        // Try to fit map to first raster
        if (!window._rasterLoaded) {
            window._rasterLoaded = true;
            try {
                var bounds = layer.getBounds();
                if (bounds && bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [40, 40] });
                    console.log('📍 Map fit to raster bounds');
                }
            } catch(e) {
                console.warn('Could not fit to raster bounds');
            }
        }
        
        console.log('✅ NDVI loaded:', year, raw ? '(raw)' : '');
    })
    .catch(function(error) {
        group._rasterLoaded = false;
        console.error('❌ NDVI loading failed:', year, error);
    });
}

// ============================================================
// LOAD MANGROVE MASK LAYER
// ============================================================

function loadMaskLayer(year) {
    var path = DATA_PATHS.masks[year];
    var group = YEAR_GROUPS['mask_' + year];

    if (!path) {
        console.warn('No mask path for:', year);
        return;
    }

    if (group._rasterLoaded) {
        console.log('Already loaded mask:', year);
        return;
    }

    group._rasterLoaded = true;

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
        console.log('✅ Mask loaded:', year);
    })
    .catch(function(error) {
        group._rasterLoaded = false;
        console.error('❌ Mask loading failed:', year, error);
    });
}

// ============================================================
// LOAD ALL RASTERS ON DEMAND
// ============================================================

function initializeRasterLayers() {
    console.log('📂 Loading all raster layers...');
    YEARS.forEach(function(year) {
        // Load NDVI
        setTimeout(function() {
            loadNDVILayer(year, false);
        }, 100 * (year - 2015));
        
        // Load Raw NDVI
        setTimeout(function() {
            loadNDVILayer(year, true);
        }, 100 * (year - 2015) + 50);
        
        // Load Mask
        setTimeout(function() {
            loadMaskLayer(year);
        }, 100 * (year - 2015) + 100);
    });
}

// ============================================================
// LAYER CONTROL EVENTS
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
    
    // Preload rasters after AOI loads
    setTimeout(function() {
        // Load first year automatically
        loadNDVILayer(2016, false);
    }, 2000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayers);
} else {
    initializeLayers();
}

console.log('🗺️ Layers module loaded');
