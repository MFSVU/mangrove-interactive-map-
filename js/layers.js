// ============================================================
// EXPOSE AOI GEOMETRIES FOR ZOOM FUNCTIONALITY
// ============================================================

// After AOIs are loaded, store geometries for zoom
function exposeAOIGeometries() {
    // This will be populated when AOIs are loaded
    window.aoiGeometries = {};
    
    // If AOI_LAYER has layers, extract geometries
    AOI_LAYER.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties) {
            var props = layer.feature.properties;
            var name = props.name || props.id;
            if (name) {
                window.aoiGeometries[name] = layer;
            }
        }
    });
    
    console.log('✅ AOI geometries exposed:', Object.keys(window.aoiGeometries).length);
}

// Override loadAOIs to expose geometries after loading
var originalLoadAOIs = loadAOIs;

loadAOIs = function() {
    console.log("Loading AOIs:", DATA_PATHS.aois);
    
    fetch(DATA_PATHS.aois)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("AOI HTTP error: " + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            console.log("AOI GeoJSON loaded");
            
            if (!data.features || data.features.length === 0) {
                console.warn("No AOI features found");
                return;
            }
            
            console.log("Number of AOIs in GeoJSON:", data.features.length);
            
            var aoiLayer = L.geoJSON(data, {
                style: function(feature) {
                    var props = feature.properties || {};
                    var name = props.name || props.id || "AOI";
                    var index = AOI_NAMES.indexOf(name);
                    if (index < 0) index = 0;
                    var color = getAoiColor(index);
                    
                    return {
                        color: color,
                        weight: AOI_STYLE.weight,
                        opacity: AOI_STYLE.opacity,
                        fillColor: color,
                        fillOpacity: AOI_STYLE.fillOpacity
                    };
                },
                onEachFeature: function(feature, layer) {
                    var props = feature.properties || {};
                    var name = props.name || props.id || "AOI";
                    var area = props.area_ha;
                    var ndvi = props.mean_ndvi;
                    
                    var html = "<strong>📍 " + name + "</strong>";
                    if (area !== undefined && area !== null) {
                        html += "<br>Area: " + Number(area).toFixed(2) + " ha";
                    }
                    if (ndvi !== undefined && ndvi !== null) {
                        html += "<br>Mean NDVI: " + Number(ndvi).toFixed(3);
                    }
                    layer.bindPopup(html);
                    
                    // Store reference for zoom
                    if (name) {
                        if (!window.aoiGeometries) window.aoiGeometries = {};
                        window.aoiGeometries[name] = layer;
                    }
                    
                    layer.on("mouseover", function() {
                        this.setStyle({
                            fillOpacity: 0.30,
                            weight: 5
                        });
                        this.bringToFront();
                    });
                    
                    layer.on("mouseout", function() {
                        var index = AOI_NAMES.indexOf(name);
                        if (index < 0) index = 0;
                        var color = getAoiColor(index);
                        this.setStyle({
                            color: color,
                            fillColor: color,
                            fillOpacity: AOI_STYLE.fillOpacity,
                            weight: AOI_STYLE.weight
                        });
                    });
                    
                    // Double-click zoom
                    layer.on('dblclick', function() {
                        zoomToAOI(name);
                    });
                }
            });
            
            AOI_LAYER.clearLayers();
            AOI_LAYER.addLayer(aoiLayer);
            
            var bounds = aoiLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [40, 40] });
            }
            
            window.AOI_BOUNDS = bounds;
            
            // Expose geometries after loading
            exposeAOIGeometries();
            
            console.log("✅ All AOIs loaded");
        })
        .catch(function(error) {
            console.error("❌ AOI loading error:", error);
        });
};

// Re-initialize
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        // Check if already initialized
        if (typeof initializeLayers === 'function') {
            initializeLayers();
        }
    });
}
