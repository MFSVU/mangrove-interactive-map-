// ============================================
// LAYER LOADING AND INTERACTIVITY - FIXED
// ============================================

// ============================================
// DIAGNOSTIC: Check if COG plugin is loaded
// ============================================

console.log('🔍 Checking for COG plugin...');
if (typeof L.tileLayer.cog === 'function') {
    console.log('✅ COG plugin is loaded!');
} else {
    console.error('❌ COG plugin NOT loaded. Check index.html script tags.');
}

// Function to safely get property from GEE feature
function getProperty(props, keys) {
    for (var i = 0; i < keys.length; i++) {
        if (props[keys[i]] !== undefined && props[keys[i]] !== null) {
            return props[keys[i]];
        }
    }
    return null;
}

// Load AOI GeoJSON
function loadAOIs() {
    console.log('📂 Loading AOI data from:', DATA_PATHS.aois);
    
    fetch(DATA_PATHS.aois)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load AOI data: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            window.aoisData = data;
            
            if (!data.features || data.features.length === 0) {
                console.warn('⚠️ No features found in GeoJSON');
                return;
            }
            
            console.log('📊 AOI Properties:', data.features[0].properties);
            
            var aoiLayer = L.geoJSON(data, {
                style: function(feature) {
                    return {
                        color: AOI_STYLE.color,
                        weight: AOI_STYLE.weight,
                        opacity: AOI_STYLE.opacity,
                        fillColor: AOI_STYLE.fillColor,
                        fillOpacity: AOI_STYLE.fillOpacity
                    };
                },
                onEachFeature: function(feature, layer) {
                    var props = feature.properties;
                    
                    var aoiName = getProperty(props, ['name', 'id', 'system:index', 'AOI']);
                    if (!aoiName) aoiName = 'AOI_025';
                    
                    var area = getProperty(props, ['area_ha', 'Area_ha', 'area', 'Area']);
                    var ndvi = getProperty(props, ['mean_ndvi', 'Mean_NDVI', 'NDVI', 'ndvi']);
                    
                    var popupContent = '<div style="min-width:160px;">';
                    popupContent += '<strong>📍 ' + aoiName + '</strong><br>';
                    popupContent += '<hr style="margin:4px 0;">';
                    popupContent += 'Area: ' + (area !== null ? area.toFixed(2) + ' ha' : 'N/A') + '<br>';
                    popupContent += 'Mean NDVI: ' + (ndvi !== null ? ndvi.toFixed(3) : 'N/A');
                    popupContent += '</div>';
                    layer.bindPopup(popupContent);
                    
                    layer.on('mouseover', function() {
                        this.setStyle({
                            fillOpacity: 0.4,
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
            
            LAYER_GROUPS.aois.clearLayers();
            LAYER_GROUPS.aois.addLayer(aoiLayer);
            
            try {
                var bounds = aoiLayer.getBounds();
                map.fitBounds(bounds, {padding: [50, 50]});
                window.AOI_BOUNDS = bounds;
                console.log('📍 AOI Bounds set:', bounds);
            } catch(e) {
                console.warn('⚠️ Could not fit bounds, using default view');
            }
            
            console.log('✅ AOI loaded successfully!');
        })
        .catch(function(error) {
            console.error('❌ Error loading AOI:', error);
        });
}

// ============================================
// LOAD RASTER LAYERS WITH PROPER CHECK
// ============================================

function loadRasterLayer(year, type) {
    var isMask = (type === 'mask');
    var isRaw = (type === 'ndvi_raw');
    var path;
    var group;
    var label;
    var opacity;
    var colorPalette;
    
    if (isMask) {
        path = DATA_PATHS.mangroveMasks[year];
        group = LAYER_GROUPS.masks;
        label = 'Mangrove Mask ' + year;
        opacity = 0.6;
        colorPalette = ['rgba(0,0,0,0)', '#00FF00'];
    } else if (isRaw) {
        path = DATA_PATHS.ndviRaw[year];
        group = LAYER_GROUPS.ndvi;
        label = 'NDVI Raw ' + year;
        opacity = 0.8;
        colorPalette = ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a'];
    } else {
        path = DATA_PATHS.ndviRasters[year];
        group = LAYER_GROUPS.ndvi;
        label = 'NDVI ' + year;
        opacity = 0.8;
        colorPalette = NDVI_PALETTE.colors;
    }
    
    // Check if COG plugin is available
    if (typeof L.tileLayer.cog === 'function') {
        try {
            var bounds = window.AOI_BOUNDS;
            
            var rasterLayer = L.tileLayer.cog(path, {
                colorPalette: colorPalette,
                opacity: opacity,
                attribution: label,
                bounds: bounds,
                min: isRaw ? -0.5 : 0,
                max: isRaw ? 0.8 : 1
            });
            
            group.addLayer(rasterLayer);
            console.log('✅ Loaded: ' + label);
        } catch(e) {
            console.warn('⚠️ Could not load ' + label + ':', e.message);
        }
    } else {
        console.warn('⚠️ COG plugin not available for: ' + label);
    }
}

// Load all raster layers
function loadAllRasters() {
    console.log('📂 Loading raster layers...');
    setTimeout(function() {
        YEARS.forEach(function(year) {
            loadRasterLayer(year, 'ndvi');
            loadRasterLayer(year, 'mask');
            loadRasterLayer(year, 'ndvi_raw');
        });
    }, 2000);
}

// Initialize all layers
function initializeLayers() {
    loadAOIs();
    loadAllRasters();
}

// When the document is ready, initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayers);
} else {
    initializeLayers();
}

console.log('🗺️ Layers module loaded.');
