# 🌿 Mangrove Monitoring - Egypt's Red Sea Coast

Interactive web map for monitoring mangrove distribution and vegetation health along Egypt's Red Sea coast.

## 📊 Features

- Interactive AOI boundaries
- Sentinel-2 NDVI rasters
- Mangrove / NDVI-threshold masks
- Four analysis years:
  - 2016
  - 2019
  - 2022
  - 2025
- Raw NDVI raster visualization
- Cloud-Optimized GeoTIFF support
- Interactive layer control
- Satellite basemap
- OpenStreetMap basemap
- AOI popups

## 📡 Data Source

Sentinel-2 imagery processed using Google Earth Engine.

## 🌿 NDVI Method

NDVI is calculated as:

NDVI = (NIR - Red) / (NIR + Red)

For Sentinel-2:

- NIR = B8
- Red = B4

Pixels with:

NDVI >= 0.20

are included in the threshold mask.

## ⚠️ Interpretation

The NDVI threshold mask should be interpreted as a mangrove mask only when the study methodology establishes NDVI >= 0.20 as the mangrove detection criterion or when the AOIs are restricted to mangrove areas.

Otherwise, the threshold represents vegetation pixels rather than uniquely identified mangrove pixels.

## 📁 Project Structure

mangrove-interactive-map/

├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   ├── map.js
│   └── layers.js
├── data/
│   ├── AOIs_Selected_Geojson.geojson
│   ├── ndvi_rasters/
│   ├── mangrove_masks/
│   └── statistics/
├── README.md
└── .gitignore

## 🗺️ Map Layers

### AOI Boundary

Displays the selected study areas.

### NDVI

Displays NDVI values using the following color scale:

- -0.5 to 0.0
- 0.0 to 0.2
- 0.2 to 0.4
- 0.4 to 0.6
- 0.6 to 0.8
- 0.8 to 1.0

### Mangrove Mask

Displays pixels satisfying:

NDVI >= 0.20

### Raw NDVI

Displays the original numerical NDVI raster exported from Google Earth Engine.

## 🌐 Deployment

The project is designed for GitHub Pages.

All raster files must be committed to the repository because the browser loads them from the project's `data/` directory.

## 📦 Raster Format

The raster files are exported from Google Earth Engine as Cloud-Optimized GeoTIFFs.

NDVI:

- Single band
- Floating-point NDVI values
- 10 m spatial resolution

Mangrove Mask:

- Single band
- Binary mask
- 10 m spatial resolution

## 🚀 Local Testing

Because browsers may restrict local file requests, use a local HTTP server instead of opening index.html directly.

For example:

python -m http.server 8000

Then open:

http://localhost:8000

## 🌍 Online Version

The application can be published using GitHub Pages.
