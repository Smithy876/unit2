/* Map of GeoJSON data from canada-strikes.geojson */

//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//Step 1. Create the Leaflet map--already done in createMap()
//Step 2. Import GeoJSON data--already done in getData()
//Step 3. Add circle markers for point features to the map--already done in AJAX callback
//Step 4. Determine the attribute for scaling the proportional symbols
//Step 5. For each feature, determine its value for the selected attribute
//Step 6. Give each feature's circle marker a radius based on its attribute value

var map;
var minValue;
var attValue;
var radius;

//function to instantiate the Leaflet map
function createMap(){
	//create the map
	map = L.map('mapid', {
		center: [53, -95],
		zoom: 4
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

// function calcMinValue(data){
//
//     //create empty array to store all data values
//     var allValues = [];
//
//     //loop through each city
//     for(var province of data.features){
//           //loop through each year
//           for(var year = 1900; year <= 1950; year+=1){
//               	//get population for current year
// 								var value = province.properties[String(year)];
//               	//add value to array
// 								//console.log(typeof value);
//               	if(typeof value == "number"){
// 										allValues.push(value);
// 								}
// 								//console.log(value);
//           }
//     }
//
//     //get minimum value of our array
//     var minValue = Math.min(...allValues)
// 		console.log(minValue);
//
//     return minValue;
// }

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {

    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
		//console.log(attValue);
		minValue = 1;
    //Flannery Appearance Compensation formula

    if(typeof (1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius) == "number"){
				radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
		}
		//console.log(typeof radius);
		//console.log(radius);

    return radius;
};

//function to add circle markers for point features
function createPropSymbols(data){

		var attribute = "1901";

		//create marker options
		var geojsonMarkerOptions = {
			radius: 8,
			fillColor: "#cc0000",
			color: "#cc0000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		};

		//Example 1.2 line 13...create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
				onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
						if(typeof feature.properties[attribute] == "number"){
								var attValue = Number(feature.properties[attribute]);
						}
						//console.log(attValue);
						//console.log(typeof attValue);

            //examine the attribute value to check that it is correct
            //console.log(feature.properties, attValue);

						//Step 6: Give each feature's circle marker a radius based on its attribute value
          	geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circle markers
						if(radius > 0){
								return L.circleMarker(latlng, geojsonMarkerOptions);
						}
        }
    }).addTo(map);
};

//function to retrieve the data and place it on the map
function getData(){
		//load the data
		$.getJSON("data/canada-strikes.geojson", function(response){
				//calculate minimum data value
				//minValue = calcMinValue(response);
				minValue = 1;
				//call prop symbol function
				createPropSymbols(response);
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
