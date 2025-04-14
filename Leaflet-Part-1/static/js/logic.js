// Create the map object
let map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tile layer
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// Earthquake data URL
let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Load the data
d3.json(earthquakeURL).then(function (data) {

  // Helper: get color by depth
  function getColor(depth) {
    if (depth > 90) return "#ea2c2c";
    if (depth > 70) return "#ea822c";
    if (depth > 50) return "#ee9c00";
    if (depth > 30) return "#eecc00";
    if (depth > 10) return "#d4ee00";
    return "#98ee00";
  }

  // Helper: get radius by magnitude
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Style for each circle
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

  // Add GeoJSON layer with markers
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
  }).addTo(map);

  // Create a legend control object
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

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ` +
        `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+ km"}`;
    }

    return div;
  };

  // Add the legend to the map
  legend.addTo(map);
});
