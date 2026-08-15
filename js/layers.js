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
            // Store AOI data globally for other functions
            window.aoisData = data;
            
            // Add AOIs to the map
            var aoiLayer = L.geoJSON(data, {
                style: function(feature) {
                    var color = AOI_STYLE.color;
                    // Optional: color by NDVI value or area
                    return {
                        color: color,
                        weight: AOI_STYLE.weight,
                        opacity: AOI_STYLE.opacity,
                        fillColor: color,
                        fillOpacity: AOI_STYLE.fillOpacity
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
                            weight: 4
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
            
            // Add AOIs to the AOI layer group
            LAYER_GROUPS.aois.clearLayers();
            LAYER_GROUPS.aois.addLayer(aoiLayer);
            
            console.log('✅ AOIs loaded successfully!');
            console.log('📊 Total AOIs:', data.features ? data.features.length : 0);
        })
        .catch(function(error) {
            console.error('❌ Error loading AOIs:', error);
            console.warn('ℹ️ Make sure aois.geojson exists in the data folder.');
        });
}

// Load raster layers (COGs)
function loadRasterLayer(year, type) {
    var isMask = (type === 'mask');
    var path = isMask ? DATA_PATHS.mangroveMasks[year] : DATA_PATHS.ndviRasters[year];
    var group = isMask ? LAYER_GROUPS.masks : LAYER_GROUPS.ndvi;
    var label = isMask ? 'Mangrove Mask ' + year : 'NDVI ' + year;
    
    // Use Leaflet COG plugin
    // Note: This requires the leaflet-cog plugin to be loaded
    // If you need an alternative method, you can use this fallback:
    var rasterLayer = L.tileLayer.cog(path, {
        colorPalette: isMask ? ['rgba(0,0,0,0)', '#00FF00'] : NDVI_PALETTE.colors,
        opacity: isMask ? 0.6 : 0.8,
        attribution: 'NDVI ' + year
    });
    
    // Add to appropriate layer group
    group.addLayer(rasterLayer);
    
    // Add to layer control with proper name
    // This is handled by the base layer control
    console.log('✅ Loaded: ' + label);
}

// Load all raster layers
function loadAllRasters() {
    YEARS.forEach(function(year) {
        // Load NDVI
        try {
            loadRasterLayer(year, 'ndvi');
        } catch(e) {
            console.warn('⚠️ Could not load NDVI for ' + year);
        }
        
        // Load mangrove mask
        try {
            loadRasterLayer(year, 'mask');
        } catch(e) {
            console.warn('⚠️ Could not load mask for ' + year);
        }
    });
}

// Initialize all layers
function initializeLayers() {
    // Load AOIs first
    loadAOIs();
    
    // Then load rasters (if COG plugin is available)
    if (typeof L.tileLayer.cog === 'function') {
        loadAllRasters();
    } else {
        console.warn('⚠️ Leaflet COG plugin not detected. Raster layers will not load.');
        console.info('ℹ️ To load COGs, include: leaflet-cog.min.js');
    }
}

// When the document is ready, initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayers);
} else {
    initializeLayers();
}
