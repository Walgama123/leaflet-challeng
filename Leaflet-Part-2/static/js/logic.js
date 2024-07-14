//Central point of the United States of America
let centLat= 44.97;
let centLong= -103.78;

// Create the tile layer that will be the background of our map.
let sat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3']
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let outdoorsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 
});

// Create a baseMaps object to hold the streetmap layer.
let baseMaps = {
"Satellite Map":sat,
"Topo Map":topo,
"Outdoors Map":outdoorsLayer
};
//Create the base map
let myMap = L.map("map", {
  center: [centLat, centLong],
  zoom: 4,
  layers: [sat]
});
 //Create legend control
 let legend = L.control({ position: "bottomright" });
 // Define the legend content
   legend.onAdd = function() {
   let div = L.DomUtil.create("div", "info legend");
   let grades = ['0-10', '10-30', '30-50', '50-70', '70-90', '90+']; // Define your earthquake magnitude grades
   let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"]; // Define corresponding colors

 // Add legend title
  div.innerHTML += '<h4>Earthquake Magnitude</h4>';

 // Loop through the grades and create a label with a colored square for each
 for (let i = 0; i < grades.length; i++) {
  div.innerHTML += '<i style="background:' + colors[i] + '"></i> ' + grades[i] + '<br>';

}
   return div;
};
// Add legend to the map
legend.addTo(myMap);

//This function accept the magnitude of the earthquake and return the size of the mrker accordingly. 
function markerSize(magnitude) {
  if (magnitude === 0) {
    return magnitude * 1
  };
  return magnitude * 10000
};

//This function accept the depth of the earthquake and return the marker color 
function markerColor(depth) {
  var color = "";
  if (depth >= -10 && depth <= 10) {
      return color = "#98ee00";
  }
  else if (depth > 10 && depth <= 30) {
      return color = "#d4ee00";
  }
  else if (depth > 30 && depth <= 50) {
      return color = "#eecc00";
  }
  else if (depth > 50 && depth <= 70) {
      return color =  "#ee9c00";
  }
  else if (depth > 70 && depth <= 90) {
      return color = "#ea822c";
  }
  else if (90 < depth) {
      return color = "#ea2c2c";
  }
  else {
      return color = "black";
  }
};

  //This finction create the markers and the layer group and pass it to create the map.
  function createEQMarkers(features) {
  
    // Initialize an array to hold earthquake markers.
    let earthquakeMarkers = [];
  
    // Loop through the all the earthquake array.
    for (let row = 0; row < features.length; row++) {
      eqData=features[row];
      // For each earthquake, create a marker, and bind a popup with the tittle and the place.
      let earthquakeMarker = L.circle([eqData.geometry.coordinates[1], eqData.geometry.coordinates[0]],{
          fillOpacity: 0.75,
          color: markerColor(eqData.geometry.coordinates[2]),
          //fillColor: markerColor(eqData.geometry.coordinates[2]),
          radius: markerSize(eqData.properties.mag),
          //title:cities[i].name      
      }).bindPopup("<h4>Place:   "  + eqData.properties.place + "</h4><hr><h4>Depth:   " + eqData.geometry.coordinates[2] + "</h4>" + "<hr><h4> Magnitude " + eqData.properties.mag + "</h4>");

      // Add the marker to the earthquakeMarkers array.
      earthquakeMarkers.push(earthquakeMarker);
    }
  
    //Retrur the layer group to the main function
     return L.layerGroup(earthquakeMarkers)
  }


 // Perform an API call to the earthquakes API to get the last seven days information.
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(link).then(function(response) {
  // Creating a GeoJSON layer with the retrieved data
  GeoJSON=response.features;
 //console.log(GeoJSON[0].geometry.coordinates);
 earthquakeMarker=createEQMarkers(GeoJSON);

 //Store tectonic plate url as a query variable
let plateQueryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
let plates = new L.layerGroup();

  // Perform a GET request to the plate query URL
  d3.json(plateQueryUrl).then(function (plateData) {

    // Create a GeoJSON layer that contains the features array on the tectonicPlate object.
    // Run the onEachFeature function once for each piece of data in the array.
    L.geoJSON(plateData).addTo(plates);
  });

  // Create an overlayMaps object to hold the earthquake layer.
  let overlayMaps = {
    Earthquakes: earthquakeMarker,
    TectonicPlates: plates
  };
  earthquakeMarker.addTo(myMap);
  plates.addTo(myMap);
// Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);   
 
});


  