// ============================================
// LAYER LOADING AND INTERACTIVITY
// ============================================

// Function to safely get property from GEE feature
function getProperty(props, keys) {
    for (var i = 0; i < keys.length; i++) {
        if (props[keys[i]] !== undefined && props[keys[i]] !== null) {
            return props[keys[i]];
        }
    }
    return null;
}

// Load AOI GeoJSON (original GEE export)
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
            
            // Check if features exist
            if (!data.features || data.features.length === 0) {
                console.warn('⚠️ No features found in GeoJSON');
                return;
            }
            
            // Log the feature properties to help debugging
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
                    
                    // Get AOI name from various possible property names
                    var aoiName = getProperty(props, ['name', 'id', 'system:index', 'AOI']);
                    if (!aoiName) aoiName = 'AOI_001';
                    
                    // Get area from various possible property names
                    var area = getProperty(props, ['area_ha', 'Area_ha', 'area', 'Area']);
                    
                    // Get NDVI from various possible property names
                    var ndvi = getProperty(props, ['mean_ndvi', 'Mean_NDVI', 'NDVI', 'ndvi']);
                    
                    // Build popup content
                    var popupContent = '<div style="min-width:160px;">';
                    popupContent += '<strong>📍 ' + aoiName + '</strong><br>';
                    popupContent += '<hr style="margin:4px 0;">';
                    popupContent += 'Area: ' + (area !== null ? area.toFixed(2) + ' ha' : 'N/A') + '<br>';
                    popupContent += 'Mean NDVI: ' + (ndvi !== null ? ndvi.toFixed(3) : 'N/A');
                    popupContent += '</div>';
                    layer.bindPopup(popupContent);
                    
                    // Add hover effects
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
            
            // Add to map
            LAYER_GROUPS.aois.clearLayers();
            LAYER_GROUPS.aois.addLayer(aoiLayer);
            
            // Fit map to AOI bounds
            try {
                map.fitBounds(aoiLayer.getBounds(), {padding: [50, 50]});
            } catch(e) {
                console.warn('⚠️ Could not fit bounds, using default view');
            }
            
            console.log('✅ AOI loaded successfully!');
            console.log('📍 AOI Name:', aoiLayer.getLayers()[0]?.feature?.properties?.name || 'Unknown');
        })
        .catch(function(error) {
            console.error('❌ Error loading AOI:', error);
            console.info('ℹ️ Make sure the GeoJSON file exists at: ' + DATA_PATHS.aois);
        });
}

// Load raster layers (Cloud-Optimized GeoTIFFs)
function loadRasterLayer(year, type) {
    var isMask = (type === 'mask');
    var path = isMask ? DATA_PATHS.mangroveMasks[year] : DATA_PATHS.ndviRasters[year];
    var group = isMask ? LAYER_GROUPS.masks : LAYER_GROUPS.ndvi;
    var label = (isMask ? 'Mangrove Mask ' : 'NDVI ') + year;
    
    // Check if COG plugin is available
    if (typeof L.tileLayer.cog === 'function') {
        try {
            var rasterLayer = L.tileLayer.cog(path, {
                colorPalette: isMask ? ['rgba(0,0,0,0)', '#00FF00'] : NDVI_PALETTE.colors,
                opacity: isMask ? 0.6 : 0.8,
                attribution: label
            });
            
            group.addLayer(rasterLayer);
            console.log('✅ Loaded: ' + label);
        } catch(e) {
            console.warn('⚠️ Could not load ' + label + ':', e.message);
        }
    } else {
        console.warn('⚠️ COG plugin not available for: ' + label);
        console.info('ℹ️ Make sure leaflet-cog.min.js is loaded in index.html');
    }
}

// Load all raster layers
function loadAllRasters() {
    console.log('📂 Loading raster layers...');
    YEARS.forEach(function(year) {
        loadRasterLayer(year, 'ndvi');
        loadRasterLayer(year, 'mask');
    });
}

// Initialize all layers
function initializeLayers() {
    // Load AOI first
    loadAOIs();
    
    // Then load rasters (with a small delay to ensure AOI loads first)
    setTimeout(function() {
        loadAllRasters();
    }, 500);
}

// When the document is ready, initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayers);
} else {
    initializeLayers();
}

// Log helper
console.log('🗺️ Layers module loaded. Ready to fetch data.');
