// ============================================================
// CONFIGURATION
// ============================================================


// ============================================================
// YEARS
// ============================================================

var YEARS = [
    2016,
    2019,
    2022,
    2025
];


// ============================================================
// AOI NAMES
// ============================================================

var AOI_NAMES = [
    'AOI_025'
];


// ============================================================
// BASEMAPS
// ============================================================

var BASEMAPS = {

    'OpenStreetMap':

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution:
                    '© OpenStreetMap contributors'
            }
        ),


    'ESRI Satellite':

        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution:
                    '© ESRI'
            }
        )

};


// ============================================================
// NDVI DISPLAY
// ============================================================

var NDVI_PALETTE = [

    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#d9ef8b',
    '#a6d96a'

];

var NDVI_MIN = -0.5;

var NDVI_MAX = 0.8;


// ============================================================
// MANGROVE MASK DISPLAY
// ============================================================

var MASK_COLOR = '#00FF00';

var MASK_OPACITY = 0.65;


// ============================================================
// DATA PATHS
// ============================================================

var DATA_PATHS = {

    aois:
        'data/AOIs_Selected_Geojson.geojson',


    mangroveMasks: {

        2016:
            'data/mangrove_masks/AOI_025_mask_2016.tif',

        2019:
            'data/mangrove_masks/AOI_025_mask_2019.tif',

        2022:
            'data/mangrove_masks/AOI_025_mask_2022.tif',

        2025:
            'data/mangrove_masks/AOI_025_mask_2025.tif'

    },


    ndviRasters: {

        2016:
            'data/ndvi_rasters/AOI_025_ndvi_2016.tif',

        2019:
            'data/ndvi_rasters/AOI_025_ndvi_2019.tif',

        2022:
            'data/ndvi_rasters/AOI_025_ndvi_2022.tif',

        2025:
            'data/ndvi_rasters/AOI_025_ndvi_2025.tif'

    },


    ndviRaw: {

        2016:
            'data/ndvi_rasters/AOI_025_ndvi_raw_2016.tif',

        2019:
            'data/ndvi_rasters/AOI_025_ndvi_raw_2019.tif',

        2022:
            'data/ndvi_rasters/AOI_025_ndvi_raw_2022.tif',

        2025:
            'data/ndvi_rasters/AOI_025_ndvi_raw_2025.tif'

    }

};


// ============================================================
// AOI STYLE
// ============================================================

var AOI_STYLE = {

    color:
        '#FF4444',

    weight:
        3,

    opacity:
        0.9,

    fillColor:
        '#FF4444',

    fillOpacity:
        0.10

};
