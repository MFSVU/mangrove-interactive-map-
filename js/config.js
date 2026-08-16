// ============================================================
// CONFIGURATION - FIXED
// ============================================================

// Years of analysis
var YEARS = [2016, 2019, 2022, 2025];

// AOI Names
var AOI_NAMES = ['AOI_001'];

// ============================================================
// BASEMAPS
// ============================================================

var BASEMAPS = {
    'OpenStreetMap': L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }
    ),
    'ESRI Satellite': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri',
            maxZoom: 19
        }
    )
};

// ============================================================
// NDVI COLOR PALETTE
// ============================================================

var NDVI_PALETTE = {
    min: -0.5,
    max: 1.0,
    colors: [
        '#d73027', // -0.5 to -0.25
        '#f46d43', // -0.25 to 0.0
        '#fdae61', // 0.0 to 0.25
        '#fee08b', // 0.25 to 0.5
        '#d9ef8b', // 0.5 to 0.75
        '#a6d96a'  // 0.75 to 1.0
    ]
};

// ============================================================
// DATA PATHS - SIMPLE AND CLEAR
// ============================================================

var DATA_PATHS = {
    // AOI GeoJSON
    aois: 'data/AOIs_Selected_Geojson.geojson',

    // NDVI (visualized/processed)
    ndvi: {
        2016: 'data/ndvi_rasters/AOI_001_ndvi_2016.tif',
        2019: 'data/ndvi_rasters/AOI_001_ndvi_2019.tif',
        2022: 'data/ndvi_rasters/AOI_001_ndvi_2022.tif',
        2025: 'data/ndvi_rasters/AOI_001_ndvi_2025.tif'
    },

    // Raw NDVI
    ndviRaw: {
        2016: 'data/ndvi_rasters/AOI_001_ndvi_raw_2016.tif',
        2019: 'data/ndvi_rasters/AOI_001_ndvi_raw_2019.tif',
        2022: 'data/ndvi_rasters/AOI_001_ndvi_raw_2022.tif',
        2025: 'data/ndvi_rasters/AOI_001_ndvi_raw_2025.tif'
    },

    // Mangrove Masks
    masks: {
        2016: 'data/mangrove_masks/AOI_001_mask_2016.tif',
        2019: 'data/mangrove_masks/AOI_001_mask_2019.tif',
        2022: 'data/mangrove_masks/AOI_001_mask_2022.tif',
        2025: 'data/mangrove_masks/AOI_001_mask_2025.tif'
    }
};

// ============================================================
// AOI STYLE
// ============================================================

var AOI_STYLE = {
    color: '#FF4444',
    weight: 3,
    opacity: 0.9,
    fillColor: '#FF4444',
    fillOpacity: 0.08
};

// ============================================================
// RASTER DISPLAY OPTIONS
// ============================================================

var NDVI_MIN = -0.5;
var NDVI_MAX = 1.0;

var MASK_OPACITY = 0.60;
var MASK_COLOR = 'rgba(0, 255, 0, 0.7)';

var RASTER_OPTIONS = {
    ndviOpacity: 0.80,
    rawNdviOpacity: 0.75,
    maskOpacity: 0.60,
    resolution: 128
};

// Log that config loaded
console.log('✅ Config loaded successfully');
console.log('📂 DATA_PATHS:', DATA_PATHS);
console.log('📅 YEARS:', YEARS);
