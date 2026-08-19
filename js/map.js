// ============================================================
// MAIN MAP INITIALIZATION
// ============================================================

// CREATE MAP
var map = L.map("map", {
    center: [26.0, 34.5],
    zoom: 12,
    zoomControl: true
});

// BASEMAPS
var baseLayers = {};
Object.keys(BASEMAPS).forEach(function(key) {
    baseLayers[key] = BASEMAPS[key];
});

// DEFAULT BASEMAP
BASEMAPS["ESRI Satellite"].addTo(map);

// AOI GROUP
var AOI_LAYER = L.layerGroup().addTo(map);

// RASTER GROUPS
var YEAR_GROUPS = {};

AOI_NAMES.forEach(function(aoiName) {
    YEARS.forEach(function(year) {
        YEAR_GROUPS["ndvi_" + aoiName + "_" + year] = L.layerGroup();
        YEAR_GROUPS["mask_" + aoiName + "_" + year] = L.layerGroup();
    });
});

// GROUPED OVERLAY LAYERS
var groupedOverlays = {};

// AOI BOUNDARY GROUP
groupedOverlays["AOI Boundaries"] = {
    "All AOI Boundaries": AOI_LAYER
};

// CREATE AOI-SPECIFIC GROUPS
AOI_NAMES.forEach(function(aoiName) {
    var aoiGroup = {};

    YEARS.forEach(function(year) {
        aoiGroup["NDVI " + year] = YEAR_GROUPS["ndvi_" + aoiName + "_" + year];
    });

    YEARS.forEach(function(year) {
        aoiGroup["Mangrove Mask " + year] = YEAR_GROUPS["mask_" + aoiName + "_" + year];
    });

    groupedOverlays[aoiName] = aoiGroup;
});

// GROUPED LAYER CONTROL
var layerControl = L.control.groupedLayers(
    baseLayers,
    groupedOverlays,
    {
        collapsed: false,
        position: "topright",
        groupCheckboxes: false
    }
).addTo(map);

// Enable scrolling in layer control
var layerControlContainer = layerControl.getContainer();
if (layerControlContainer) {
    L.DomEvent.disableClickPropagation(layerControlContainer);
    L.DomEvent.disableScrollPropagation(layerControlContainer);
    layerControlContainer.style.overflowY = "auto";
    layerControlContainer.style.overflowX = "hidden";
}

// GLOBAL REFERENCES
window.AOI_LAYER = AOI_LAYER;
window.YEAR_GROUPS = YEAR_GROUPS;
window.map = map;
window.layerControl = layerControl;

console.log("🌿 Mangrove Interactive Map initialized");
console.log("Number of AOIs:", AOI_NAMES.length);
console.log("Years:", YEARS);

// ============================================================
// MODAL CONTROLS - Open Images
// ============================================================

var btnStudyArea = document.getElementById('btnStudyArea');
var btnNDVI = document.getElementById('btnNDVI');
var btnMask = document.getElementById('btnMask');

var modalStudyArea = document.getElementById('modalStudyArea');
var modalNDVI = document.getElementById('modalNDVI');
var modalMask = document.getElementById('modalMask');

var closeStudyArea = document.getElementById('closeStudyArea');
var closeNDVI = document.getElementById('closeNDVI');
var closeMask = document.getElementById('closeMask');

// Open modals
if (btnStudyArea && modalStudyArea) {
    btnStudyArea.addEventListener('click', function() {
        modalStudyArea.classList.add('show');
    });
}
if (btnNDVI && modalNDVI) {
    btnNDVI.addEventListener('click', function() {
        modalNDVI.classList.add('show');
    });
}
if (btnMask && modalMask) {
    btnMask.addEventListener('click', function() {
        modalMask.classList.add('show');
    });
}

// Close modals (X button)
if (closeStudyArea && modalStudyArea) {
    closeStudyArea.addEventListener('click', function() {
        modalStudyArea.classList.remove('show');
    });
}
if (closeNDVI && modalNDVI) {
    closeNDVI.addEventListener('click', function() {
        modalNDVI.classList.remove('show');
    });
}
if (closeMask && modalMask) {
    closeMask.addEventListener('click', function() {
        modalMask.classList.remove('show');
    });
}

// Close modals by clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modalStudyArea) {
        modalStudyArea.classList.remove('show');
    }
    if (event.target === modalNDVI) {
        modalNDVI.classList.remove('show');
    }
    if (event.target === modalMask) {
        modalMask.classList.remove('show');
    }
});

// Close modals with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (modalStudyArea) modalStudyArea.classList.remove('show');
        if (modalNDVI) modalNDVI.classList.remove('show');
        if (modalMask) modalMask.classList.remove('show');
    }
});

console.log('✅ Image buttons initialized');

// ============================================================
// ZOOM-TO-AOI FUNCTIONALITY - UPDATED
// ============================================================

// Function to zoom to an AOI using its geometry
function zoomToAOI(aoiName) {
    console.log('🔍 Zooming to:', aoiName);
    
    // Try to get geometry from layers.js exposed data
    var geometry = null;
    
    // Check if window.aoiGeometries is available (set in layers.js)
    if (window.aoiGeometries && window.aoiGeometries[aoiName]) {
        geometry = window.aoiGeometries[aoiName];
    }
    
    // If not, try to get from the AOI layer
    if (!geometry) {
        // Search through AOI layer for matching feature
        AOI_LAYER.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties) {
                var props = layer.feature.properties;
                var name = props.name || props.id;
                if (name === aoiName) {
                    try {
                        geometry = layer.getBounds();
                    } catch(e) {}
                }
            }
        });
    }
    
    if (geometry) {
        try {
            var bounds = geometry.getBounds ? geometry.getBounds() : geometry.bounds();
            if (bounds && bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
                console.log('✅ Zoomed to:', aoiName);
                return;
            }
        } catch(e) {}
    }
    
    console.warn('⚠️ Could not zoom to:', aoiName);
}

// ============================================================
// CUSTOM ZOOM PANEL FOR AOIs
// ============================================================

function createAOIZoomPanel() {
    // Remove existing panel if any
    var existingPanel = document.querySelector('.aoi-zoom-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    var panel = document.createElement('div');
    panel.className = 'aoi-zoom-panel';
    
    var title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = '📍 Zoom to AOI';
    panel.appendChild(title);
    
    // Use AOI_NAMES from config
    var sortedNames = AOI_NAMES.slice().sort();
    
    sortedNames.forEach(function(aoiName) {
        var btn = document.createElement('button');
        btn.textContent = aoiName;
        btn.title = 'Zoom to ' + aoiName;
        
        btn.onclick = function() {
            zoomToAOI(aoiName);
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
    
    // Add panel to map container
    var mapContainer = map.getContainer();
    if (mapContainer) {
        mapContainer.appendChild(panel);
        console.log('✅ AOI zoom panel created with', sortedNames.length, 'AOIs');
    }
}

// Create zoom panel after map loads
setTimeout(function() {
    createAOIZoomPanel();
}, 1500);

// Also listen for when AOI layer is added to ensure panel exists
map.on('overlayadd', function(event) {
    var name = event.name;
    if (name && name.startsWith('AOI_')) {
        // If panel doesn't exist, create it
        if (!document.querySelector('.aoi-zoom-panel')) {
            createAOIZoomPanel();
        }
        // Also try to zoom if it's an AOI boundary
        if (name === 'All AOI Boundaries' || name.startsWith('AOI_')) {
            // Extract AOI name for zoom
            var aoiName = name;
            if (name === 'All AOI Boundaries') {
                // Don't zoom for all boundaries
                return;
            }
            zoomToAOI(aoiName);
        }
    }
});

// ============================================================
// DOUBLE-CLICK ZOOM FOR AOI LAYERS
// ============================================================

function addAOIZoom(layer, aoiName) {
    if (!layer) return;
    layer.on('dblclick', function() {
        zoomToAOI(aoiName);
    });
}

console.log('✅ Zoom-to-AOI functionality ready');
