// ============================================================
// CONFIGURATION
// ============================================================

const YEARS = [2016, 2019, 2022, 2025];

// ============================================================
// AOI
// ============================================================

const AOI_NAMES = [
    "AOI_001"
];

// ============================================================
// BASEMAPS
// ============================================================

const BASEMAPS = {
    "OpenStreetMap":
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19
            }
        ),
    "ESRI Satellite":
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution: "&copy; Esri",
                maxZoom: 19
            }
        )
};

// ============================================================
// NDVI COLOR PALETTE
// ============================================================

const NDVI_PALETTE = {
    min: -0.6,
    max: 0.6,
    colors: [
        "#d73027",
        "#f46d43",
        "#fdae61",
        "#fee08b",
        "#d9ef8b",
        "#a6d96a"
    ]
};

// ============================================================
// DATA PATHS - FIXED STRUCTURE
// ============================================================

const DATA_PATHS = {
    // AOI
    aois: "data/AOIs_Selected_Geojson.geojson",

    // NDVI (processed/visualized)
    ndvi: {
        2016: "data/ndvi_rasters/AOI_001_ndvi_2016.tif",
        2019: "data/ndvi_rasters/AOI_001_ndvi_2019.tif",
        2022: "data/ndvi_rasters/AOI_001_ndvi_2022.tif",
        2025: "data/ndvi_rasters/AOI_001_ndvi_2025.tif"
    },

    // Raw NDVI
    ndviRaw: {
        2016: "data/ndvi_rasters/AOI_001_ndvi_raw_2016.tif",
        2019: "data/ndvi_rasters/AOI_001_ndvi_raw_2019.tif",
        2022: "data/ndvi_rasters/AOI_001_ndvi_raw_2022.tif",
        2025: "data/ndvi_rasters/AOI_001_ndvi_raw_2025.tif"
    },

    // Mangrove Masks
    masks: {
        2016: "data/mangrove_masks/AOI_001_mask_2016.tif",
        2019: "data/mangrove_masks/AOI_001_mask_2019.tif",
        2022: "data/mangrove_masks/AOI_001_mask_2022.tif",
        2025: "data/mangrove_masks/AOI_001_mask_2025.tif"
    }
};

// ============================================================
// AOI STYLE
// ============================================================

const AOI_STYLE = {
    color: "#FF4444",
    weight: 3,
    opacity: 0.9,
    fillColor: "#FF4444",
    fillOpacity: 0.08
};

// ============================================================
// RASTER DISPLAY OPTIONS
// ============================================================

const NDVI_MIN = -0.6;
const NDVI_MAX = 0.6;

const MASK_OPACITY = 0.60;
const MASK_COLOR = "rgba(0, 255, 0, 0.7)";

const RASTER_OPTIONS = {
    ndviOpacity: 0.80,
    rawNdviOpacity: 0.75,
    maskOpacity: 0.60,
    resolution: 128
};

// Log that config loaded
console.log('✅ Config loaded successfully');
console.log('📂 DATA_PATHS:', DATA_PATHS);
console.log('📅 YEARS:', YEARS);
