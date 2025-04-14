// STEP 1: Create the main map view
let map = L.map('map').setView([20, 0], 2);

// STEP 2: Add the base tile layer (street map from OpenStreetMap)
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
});
basemap.addTo(map); // Show it by default

// STEP 3: Create two layer groups: one for earthquakes and one for tectonic plates
let earthquakeLayer = new L.LayerGroup();
let tectonicLayer = new L.LayerGroup();

// STEP 4: Add base and overlay layers for layer control
let baseMap = {
  "Street Map": basemap
};

let overlayMap = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicLayer
};

// STEP 5: Add layer control to top-right of the map
L.control.layers(baseMap, overlayMap, {
  collapsed: false
}).addTo(map);

// STEP 6: Define the USGS earthquake GeoJSON URL (past 7 days)
let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// STEP 7: Load earthquake data with D3
d3.json(earthquakeURL).then(function (data) {

  // Function to pick color based on depth
  function getColor(depth) {
    if (depth > 90) return "#ea2c2c";
    if (depth > 70) return "#ea822c";
    if (depth > 50) return "#ee9c00";
    if (depth > 30) return "#eecc00";
    if (depth > 10) return "#d4ee00";
    return "#98ee00";
  }

  // Function to pick radius based on magnitude
  function getRadius(mag) {
    return mag === 0 ? 1 : mag * 4;
  }

  // Styling function for each circle
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]), // depth
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Add earthquake circles to the earthquake layer
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<strong>Location:</strong> ${feature.properties.place}<br>` +
        `<strong>Magnitude:</strong> ${feature.properties.mag}<br>` +
        `<strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    }
  }).addTo(earthquakeLayer);

  // Show earthquake markers by default
  earthquakeLayer.addTo(map);

  // Create a legend for depth color scale
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Add color boxes with depth labels
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ` +
        `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+ km"}`;
    }

    return div;
  };

  legend.addTo(map); // Add legend to map
});

// STEP 8: Load tectonic plate data from GitHub
let plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(plateURL).then(function (plateData) {
  L.geoJson(plateData, {
    color: "orange",
    weight: 2
  }).addTo(tectonicLayer);

  // Show tectonic plates layer by default
  tectonicLayer.addTo(map);
});
