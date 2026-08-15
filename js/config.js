// ============================================
// CONFIGURATION FILE
// ============================================

// Years of analysis
var YEARS = [2016, 2019, 2022, 2025];

// AOI Names
var AOI_NAMES = ['AOI_025'];

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
    max: 0.8,
    colors: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a']
};

// Data file paths - UPDATED for your files
var DATA_PATHS = {
    aois: 'data/AOIs_Selected_Geojson.geojson',
    mangroveMasks: {
        2016: 'data/mangrove_masks/AOI_025_mask_2016.tif',
        2019: 'data/mangrove_masks/AOI_025_mask_2019.tif',
        2022: 'data/mangrove_masks/AOI_025_mask_2022.tif',
        2025: 'data/mangrove_masks/AOI_025_mask_2025.tif'
    },
    ndviRasters: {
        2016: 'data/ndvi_rasters/AOI_025_ndvi_2016.tif',
        2019: 'data/ndvi_rasters/AOI_025_ndvi_2019.tif',
        2022: 'data/ndvi_rasters/AOI_025_ndvi_2022.tif',
        2025: 'data/ndvi_rasters/AOI_025_ndvi_2025.tif'
    },
    ndviRaw: {
        2016: 'data/ndvi_rasters/AOI_025_ndvi_raw_2016.tif',
        2019: 'data/ndvi_rasters/AOI_025_ndvi_raw_2019.tif',
        2022: 'data/ndvi_rasters/AOI_025_ndvi_raw_2022.tif',
        2025: 'data/ndvi_rasters/AOI_025_ndvi_raw_2025.tif'
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
