// ============================================
// CONFIGURATION FILE
// ============================================

// Years of analysis
var YEARS = [2016, 2019, 2022, 2025];

// Base map options
var BASEMAPS = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),
    'ESRI Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© ESRI'
    })
};

// NDVI Color Palette
var NDVI_PALETTE = {
    min: -0.5,
    max: 1.0,
    colors: [
        '#d73027', // -0.5 - 0.0
        '#f46d43', // 0.0 - 0.2
        '#fdae61', // 0.2 - 0.4
        '#fee08b', // 0.4 - 0.6
        '#d9ef8b', // 0.6 - 0.8
        '#a6d96a'  // 0.8 - 1.0
    ]
};

// Data file paths - use PNG for simplicity (convert from TIFF)
var DATA_PATHS = {
    aois: 'data/AOI_001_geojson.geojson',
    mangroveMasks: {
        2016: 'data/mangrove_masks/AOI_001_mask_2016.png',
        2019: 'data/mangrove_masks/AOI_001_mask_2019.png',
        2022: 'data/mangrove_masks/AOI_001_mask_2022.png',
        2025: 'data/mangrove_masks/AOI_001_mask_2025.png'
    },
    ndviRasters: {
        2016: 'data/ndvi_rasters/AOI_001_ndvi_2016.png',
        2019: 'data/ndvi_rasters/AOI_001_ndvi_2019.png',
        2022: 'data/ndvi_rasters/AOI_001_ndvi_2022.png',
        2025: 'data/ndvi_rasters/AOI_001_ndvi_2025.png'
    }
};

// AOI styling
var AOI_STYLE = {
    color: '#FF4444',
    weight: 3,
    opacity: 0.9,
    fillColor: '#FF4444',
    fillOpacity: 0.1
};
