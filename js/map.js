// ============================================================
// MAIN MAP INITIALIZATION
// ============================================================

// CREATE MAP
var map = L.map('map', {
    center: [26.0, 34.5],
    zoom: 12,
    zoomControl: true
});

// BASEMAPS
var baseLayers = {};
Object.keys(BASEMAPS).forEach(function(key) {
    baseLayers[key] = BASEMAPS[key];
});

// Default basemap
BASEMAPS['ESRI Satellite'].addTo(map);

// AOI GROUP
var AOI_LAYER = L.layerGroup().addTo(map);

// YEAR-SPECIFIC RASTER GROUPS
var YEAR_GROUPS = {};

YEARS.forEach(function(year) {
    YEAR_GROUPS['ndvi_' + year] = L.layerGroup();
    YEAR_GROUPS['mask_' + year] = L.layerGroup();
    YEAR_GROUPS['ndvi_raw_' + year] = L.layerGroup();
});

// OVERLAY LAYERS
var overlayLayers = {
    'AOI Boundary': AOI_LAYER
};

// ADD NDVI
YEARS.forEach(function(year) {
    overlayLayers['NDVI ' + year] = YEAR_GROUPS['ndvi_' + year];
});

// ADD RAW NDVI
YEARS.forEach(function(year) {
    overlayLayers['Raw NDVI ' + year] = YEAR_GROUPS['ndvi_raw_' + year];
});

// ADD MASK
YEARS.forEach(function(year) {
    overlayLayers['Mangrove Mask ' + year] = YEAR_GROUPS['mask_' + year];
});

// LAYER CONTROL
var layerControl = L.control.layers(
    baseLayers,
    overlayLayers,
    {
        collapsed: false,
        position: 'topright'
    }
).addTo(map);

// GLOBAL REFERENCES
window.AOI_LAYER = AOI_LAYER;
window.YEAR_GROUPS = YEAR_GROUPS;
window.map = map;
window.layerControl = layerControl;

console.log('🌿 Mangrove Interactive Map initialized');
console.log('Years:', YEARS);
