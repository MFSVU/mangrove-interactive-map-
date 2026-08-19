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

// ============================================================
// ZOOM-TO-AOI FUNCTIONALITY - FIXED
// ============================================================

// Function to zoom to an AOI
function zoomToAOI(aoiKey) {
    console.log('🔍 Attempting to zoom to:', aoiKey);
    
    // Try to get geometry from window.aois (set in layers.js)
    var geometry = window.aois ? window.aois[aoiKey] : null;
    
    if (!geometry) {
        console.warn('⚠️ AOI not found in window.aois:', aoiKey);
        return;
    }
    
    try {
        // Get bounds from geometry
        var bounds = geometry.bounds();
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
            console.log('✅ Zoomed to:', aoiKey);
        } else {
            console.warn('⚠️ Invalid bounds for:', aoiKey);
        }
    } catch(e) {
        console.warn('⚠️ Could not zoom to:', aoiKey, e.message);
    }
}

// ============================================================
// CUSTOM ZOOM PANEL FOR AOIs
// ============================================================

function createAOIZoomPanel() {
    // Wait for AOIs to be loaded
    var checkInterval = setInterval(function() {
        if (window.aoiKeys && window.aoiKeys.length > 0) {
            clearInterval(checkInterval);
            buildPanel();
        }
    }, 500);
    
    // Also try immediately
    if (window.aoiKeys && window.aoiKeys.length > 0) {
        clearInterval(checkInterval);
        buildPanel();
    }
    
    function buildPanel() {
        var panel = L.DomUtil.create('div', 'aoi-zoom-panel');
        panel.style.position = 'absolute';
        panel.style.top = '10px';
        panel.style.right = '10px';
        panel.style.background = 'white';
        panel.style.padding = '10px';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        panel.style.zIndex = '1000';
        panel.style.maxHeight = '300px';
        panel.style.overflowY = 'auto';
        panel.style.minWidth = '120px';
        panel.style.fontSize = '12px';
        
        var title = document.createElement('div');
        title.innerHTML = '<strong>📍 Zoom to AOI</strong>';
        title.style.marginBottom = '6px';
        title.style.borderBottom = '1px solid #ddd';
        title.style.paddingBottom = '4px';
        panel.appendChild(title);
        
        // Sort AOI keys for consistent order
        var sortedKeys = window.aoiKeys.slice().sort();
        
        sortedKeys.forEach(function(aoiKey) {
            var btn = document.createElement('button');
            btn.textContent = aoiKey;
            btn.style.display = 'block';
            btn.style.width = '100%';
            btn.style.padding = '4px 8px';
            btn.style.margin = '2px 0';
            btn.style.border = '1px solid #ccc';
            btn.style.borderRadius = '4px';
            btn.style.background = '#f8f9fa';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '11px';
            btn.style.transition = 'background 0.2s';
            
            btn.onclick = function() {
                zoomToAOI(aoiKey);
            };
            
            btn.onmouseover = function() {
                this.style.background = '#e9ecef';
                this.style.borderColor = '#2C3E50';
            };
            
            btn.onmouseout = function() {
                this.style.background = '#f8f9fa';
                this.style.borderColor = '#ccc';
            };
            
            panel.appendChild(btn);
        });
        
        // Remove panel if already exists
        var existingPanel = document.querySelector('.aoi-zoom-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        map.getContainer().appendChild(panel);
        console.log('✅ AOI zoom panel created with', window.aoiKeys.length, 'AOIs');
    }
}

// Initialize the zoom panel after map loads
setTimeout(function() {
    createAOIZoomPanel();
}, 1000);

// Also create panel when AOIs are loaded via overlayadd event
map.on('overlayadd', function(event) {
    if (event.name && event.name.startsWith('AOI_')) {
        // If panel doesn't exist, create it
        if (!document.querySelector('.aoi-zoom-panel')) {
            createAOIZoomPanel();
        }
    }
});

// ============================================================
// ZOOM ON AOI LAYER ACTIVATION (Optional)
// ============================================================

// When an AOI layer is checked, zoom to it
map.on('overlayadd', function(event) {
    var name = event.name;
    if (name && name.startsWith('AOI_')) {
        zoomToAOI(name);
    }
});

console.log('✅ Zoom-to-AOI functionality ready');
