// ============================================
// LAYER LOADING AND INTERACTIVITY
// ============================================

// Load AOI GeoJSON
function loadAOIs() {
    fetch(DATA_PATHS.aois)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load AOI data: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            window.aoisData = data;
            
            var aoiLayer = L.geoJSON(data, {
                style: function(feature) {
                    return {
                        color: '#FF4444',
                        weight: 3,
                        opacity: 0.9,
                        fillColor: '#FF4444',
                        fillOpacity: 0.1
                    };
                },
                onEachFeature: function(feature, layer) {
                    // Bind popup with AOI details
                    var props = feature.properties;
                    var popupContent = '<strong>' + (props.name || props.id || 'AOI') + '</strong><br>';
                    popupContent += 'Area: ' + (props.area_ha ? props.area_ha.toFixed(2) : 'N/A') + ' ha<br>';
                    popupContent += 'Mean NDVI: ' + (props.mean_ndvi ? props.mean_ndvi.toFixed(3) : 'N/A');
                    layer.bindPopup(popupContent);
                    
                    // Add hover effect
                    layer.on('mouseover', function() {
                        this.setStyle({
                            fillOpacity: 0.4,
                            weight: 5
                        });
                        this.bringToFront();
                    });
                    layer.on('mouseout', function() {
                        this.setStyle({
                            fillOpacity: 0.1,
                            weight: 3
                        });
                    });
                }
            });
            
            LAYER_GROUPS.aois.clearLayers();
            LAYER_GROUPS.aois.addLayer(aoiLayer);
            
            // Fit map to AOI bounds
            map.fitBounds(aoiLayer.getBounds());
            
            console.log('✅ AOIs loaded successfully!');
        })
        .catch(function(error) {
            console.error('❌ Error loading AOIs:', error);
        });
}

// Load raster layers (COGs)
function loadRasterLayer(year, type) {
    var isMask = (type === 'mask');
    var path = isMask ? DATA_PATHS.mangroveMasks[year] : DATA_PATHS.ndviRasters[year];
    var group = isMask ? LAYER_GROUPS.masks : LAYER_GROUPS.ndvi;
    var label = isMask ? 'Mangrove Mask ' + year : 'NDVI ' + year;
    
    // Check if COG plugin is available
    if (typeof L.tileLayer.cog === 'function') {
        var rasterLayer = L.tileLayer.cog(path, {
            colorPalette: isMask ? ['rgba(0,0,0,0)', '#00FF00'] : NDVI_PALETTE.colors,
            opacity: isMask ? 0.6 : 0.8,
            attribution: label
        });
        
        group.addLayer(rasterLayer);
        console.log('✅ Loaded: ' + label);
    } else {
        console.warn('⚠️ COG plugin not available for: ' + label);
    }
}

// Load all raster layers
function loadAllRasters() {
    YEARS.forEach(function(year) {
        try {
            loadRasterLayer(year, 'ndvi');
        } catch(e) {
            console.warn('⚠️ Could not load NDVI for ' + year);
        }
        
        try {
            loadRasterLayer(year, 'mask');
        } catch(e) {
            console.warn('⚠️ Could not load mask for ' + year);
        }
    });
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
