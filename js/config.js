// ============================================================
// CONFIGURATION
// ============================================================

const YEARS = [
    2016,
    2019,
    2022,
    2025
];


// ============================================================
// AOIs
// ============================================================
//
// Available AOIs:
// AOI_001 ... AOI_028
//
// The application will use the corresponding files:
//
// AOI_001_ndvi_2016.tif
// AOI_001_ndvi_2019.tif
// ...
//
// and:
//
// AOI_001_mask_2016.tif
// AOI_001_mask_2019.tif
// ...
// ============================================================

const AOI_NAMES = [

    "AOI_001",
    "AOI_002",
    "AOI_003",
    "AOI_004",
    "AOI_005",
    "AOI_006",
    "AOI_007",
    "AOI_008",
    "AOI_009",
    "AOI_010",
    "AOI_011",
    "AOI_012",
    "AOI_013",
    "AOI_014",
    "AOI_015",
    "AOI_016",
    "AOI_017",
    "AOI_018",
    "AOI_019",
    "AOI_020",
    "AOI_021",
    "AOI_022",
    "AOI_023",
    "AOI_024",
    "AOI_025",
    "AOI_026",
    "AOI_027",
    "AOI_028"

];


// ============================================================
// BASEMAPS
// ============================================================

const BASEMAPS = {

    "OpenStreetMap":

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                attribution:
                    "&copy; OpenStreetMap contributors",

                maxZoom:
                    19

            }
        ),


    "ESRI Satellite":

        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                attribution:
                    "&copy; Esri",

                maxZoom:
                    19

            }
        )

};


// ============================================================
// NDVI COLOR PALETTE
// ============================================================
//
// NDVI:
//
// -0.50 ---------------- 0 ---------------- +0.50
//  RED                 WHITE              GREEN
//
// Negative NDVI:
//   -0.50 to 0.00 = red grades
//
// Positive NDVI:
//    0.0 to +0.50 = green grades
//
// The GeoTIFF remains a numerical NDVI raster.
// These colors are ONLY for web visualization.
// ============================================================

const NDVI_PALETTE = {

    min:
        -0.50,

    max:
        0.50,

    colors: [

        "#67001f",
        "#b2182b",
        "#d6604d",
        "#f4a582",
        "#fddbc7",

        "#ffffff",

        "#d9f0d3",
        "#a6dba0",
        "#5aae61",
        "#1b7837",
        "#00441b"

    ]

};


// ============================================================
// DATA PATHS
// ============================================================
//
// Project structure:
//
// data/
// ├── AOIs_Selected_Geojson.geojson
// │
// ├── ndvi_rasters/
// │   ├── AOI_001_ndvi_2016.tif
// │   ├── AOI_001_ndvi_2019.tif
// │   ├── AOI_001_ndvi_2022.tif
// │   ├── AOI_001_ndvi_2025.tif
// │   ├── AOI_002_ndvi_2016.tif
// │   └── ...
// │
// └── mangrove_masks/
//     ├── AOI_001_mask_2016.tif
//     ├── AOI_001_mask_2019.tif
//     ├── AOI_001_mask_2022.tif
//     ├── AOI_001_mask_2025.tif
//     └── ...
//
// IMPORTANT:
// Raw NDVI is intentionally NOT included.
// ============================================================

const DATA_PATHS = {

    // AOI GeoJSON
    aois:
        "data/AOIs_Selected_Geojson.geojson",


    // NDVI folder
    ndviFolder:
        "data/ndvi_rasters/",


    // Mangrove mask folder
    maskFolder:
        "data/mangrove_masks/"

};


// ============================================================
// AOI STYLE
// ============================================================

const AOI_STYLE = {

    color:
        "#FF4444",

    weight:
        3,

    opacity:
        0.9,

    fillColor:
        "#FF4444",

    fillOpacity:
        0.08

};


// ============================================================
// NDVI RANGE
// ============================================================

const NDVI_MIN =
    -0.50;

const NDVI_MAX =
    0.50;


// ============================================================
// MANGROVE MASK
// ============================================================

const MASK_OPACITY =
    0.80;

const MASK_COLOR =
    "rgba(0, 255, 0, 0.7)";


// ============================================================
// RASTER OPTIONS
// ============================================================

const RASTER_OPTIONS = {

    ndviOpacity:
        1.0,

    maskOpacity:
        1.0,

    resolution:
        128

};


// ============================================================
// AOI COLORS
// ============================================================

const AOI_COLORS = [

    "#FF0000",
    "#00AEEF",
    "#00AA00",
    "#FF8C00",
    "#8A2BE2",
    "#00CED1",
    "#FF1493",
    "#FFD700",
    "#1E90FF",
    "#32CD32",
    "#FF4500",
    "#9400D3",
    "#00FA9A",
    "#DC143C",
    "#4169E1",
    "#DAA520",
    "#20B2AA",
    "#C71585",
    "#7B68EE",
    "#228B22",
    "#FF6347",
    "#4682B4",
    "#B8860B",
    "#9932CC",
    "#008B8B",
    "#B22222",
    "#556B2F",
    "#483D8B"

];


// ============================================================
// CONSOLE LOG
// ============================================================

console.log("✅ Config loaded successfully");
console.log("📅 Years:", YEARS);
console.log("📋 AOIs:", AOI_NAMES.length);
console.log("📍 NDVI range:", NDVI_MIN, "to", NDVI_MAX);
