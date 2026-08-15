// ============================================
// MAIN MAP INITIALIZATION
// ============================================

// Initialize the map
var map = L.map('map', {
    center: [26.0, 34.5],
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

// Create separate layer groups for each year
var yearGroups = {};
YEARS.forEach(function(year) {
    yearGroups['ndvi_' + year] = L.layerGroup();
    yearGroups['mask_' + year] = L.layerGroup();
});

// Add all layer groups to map
Object.keys(yearGroups).forEach(function(key) {
    yearGroups[key].addTo(map);
});

// ============================================
// LAYER CONTROL WITH SEPARATE YEAR BUTTONS
// ============================================

var overlayLayers = {
    'AOI Boundary': overlayGroups.aois
};

// Add NDVI layers for each year
YEARS.forEach(function(year) {
    overlayLayers['NDVI ' + year] = yearGroups['ndvi_' + year];
});

// Add Mangrove Mask layers for each year
YEARS.forEach(function(year) {
    overlayLayers['Mangrove Mask ' + year] = yearGroups['mask_' + year];
});

// Add layer control
var layerControl = L.control.layers(baseLayers, overlayLayers, {
    collapsed: false,
    position: 'topright'
}).addTo(map);

// Store layer groups for access in layers.js
var LAYER_GROUPS = overlayGroups;
var YEAR_GROUPS = yearGroups;

// Log ready message
console.log('🌿 Mangrove Interactive Map loaded successfully!');
console.log('📅 Years:', YEARS.join(', '));
console.log('📍 Data source: GEE exports');
console.log('🔄 Waiting for AOI data to load...');
