// ============================================
// MAIN MAP INITIALIZATION
// ============================================

// Initialize the map
var map = L.map('map', {
    center: [26.0, 34.5],  // Will be updated when AOI loads
    zoom: 10,
    zoomControl: true
});

// Add base layers
var baseLayers = {};
Object.keys(BASEMAPS).forEach(function(key) {
    baseLayers[key] = BASEMAPS[key];
});

// Add default base layer
BASEMAPS['ESRI Satellite'].addTo(map);

// Create layer groups for organization
var overlayGroups = {
    aois: L.layerGroup().addTo(map),
    masks: L.layerGroup(),
    ndvi: L.layerGroup()
};

// Add layer control
var layerControl = L.control.layers(baseLayers, {
    'AOI Boundary': overlayGroups.aois,
    'Mangrove Masks': overlayGroups.masks,
    'NDVI Rasters': overlayGroups.ndvi
}, {
    collapsed: false,
    position: 'topright'
}).addTo(map);

// Store layer groups for access in layers.js
var LAYER_GROUPS = overlayGroups;

// Log ready message
console.log('🌿 Mangrove Interactive Map loaded successfully!');
console.log('📅 Years:', YEARS.join(', '));
console.log('📍 Data source: GEE exports');
console.log('🔄 Waiting for AOI data to load...');
