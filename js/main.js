/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
	//create the map
	var map = L.map('mapid', {
		center: [20, 0],
		zoom: 2
	});

	//add OSM base tilelayer
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/dark-v10',
      accessToken: 'pk.eyJ1Ijoic21pdGh5ODc2IiwiYSI6ImNrNmpyMGNiNTAwaDczbW15ZTA0NXRxY3MifQ.otKyUrLqesRLXLhm-7tZ2A'
  }).addTo(map);

	//call getData function
	getData(map);
};

//function to retrieve the data and place it on the map
function getData(map){
	//load the data
	$.ajax("data/megacities.geojson", {
		dataType: "json",
		success: function(response){

			//create marker options
			var geojsonMarkerOptions = {
				radius: 8,
				fillColor: "#ff7800",
				color: "#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			};

      //create a Leaflet GeoJSON layer and add it to the map
      L.geoJson(response, {
          onEachFeature: onEachFeature,
          pointToLayer: function (feature, latlng){
              return L.circleMarker(latlng, geojsonMarkerOptions);
          }
      }).addTo(map);
		}
	});
};

//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
    	for (var property in feature.properties){
    		popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
    	}
        layer.bindPopup(popupContent);
    };
};

$(document).ready(createMap);
