/* Map of GeoJSON data from canada-strikes.geojson */

//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//Step 1. Create the Leaflet map--already done in createMap()
//Step 2. Import GeoJSON data--already done in getData()
//Step 3. Add circle markers for point features to the map--already done in AJAX callback
//Step 4. Determine the attribute for scaling the proportional symbols
//Step 5. For each feature, determine its value for the selected attribute
//Step 6. Give each feature's circle marker a radius based on its attribute value


// variables that didn't want to play nice so they're in a time out up here
var map;
var minValue;
var attValue;
var radius;
var layer;
var attributes;

//function to instantiate the Leaflet map
function createMap(){
	//create the map
	map = L.map('mapid', {
		center: [53, -95],
		zoom: 4,
		minZoom: 4,
		maxZoom: 5,
		dragging: false,
		//maxBounds: L.latLngBounds() //working on this one
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

// Calculating the minimum value - not really necessary for this dataset
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

//Build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with values
        if (attribute.indexOf("19") > -1){
            attributes.push(attribute);
        };
    };

    //check result
		//console.log(attributes);
		//console.log(attributes[0]);
		var attribute = attributes[0];

    return attributes;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {

    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;

		//calculate minimum data value
		//minValue = calcMinValue(response);
		minValue = 1;

    //Flannery Appearance Compensation formula
    if(typeof (1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius) == "number"){
				radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
		}
		//console.log(typeof radius);
		//console.log(radius);

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){ //changing the order here makes attributes become an object, but its contents are still undefined
    //Determine which attribute to visualize with proportional symbols
		//console.log(typeof attributes);
		//console.log(attributes[0]);

		var attribute = attributes[0];
		//check
		//console.log(attribute);

    //create marker options
		var markerOptions = {
			radius: 8,
			fillColor: "#d71920",
			color: "#d71920",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		};

    //For each feature, determine its value for the selected attribute
		if(typeof feature.properties[attribute] == "number"){
				attValue = Number(feature.properties[attribute]);
		};

    //Give each feature's circle marker a radius based on its attribute value
    markerOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
		if(radius > 0){
				layer = L.circleMarker(latlng, markerOptions);
		};


    //build popup content string
		var popupContent = "<h3><b>" + feature.properties.Province + "</b></h3><p><b>" + attribute + ":</b> " + feature.properties[attribute] + " strikes</p>";
		//some provinces are being mislabeled when there are 0 value provinces

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
				offset: new L.Point(0,-markerOptions.radius)
		});

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
		//console.log(attributes);

		L.geoJson(data, {
        pointToLayer: function(feature, latlng){
						return pointToLayer(feature, latlng, attributes);
				}
    }).addTo(map);
};

// //old function to add circle markers for point features
// function createPropSymbols(data){
//
// 		var attribute = "1901";
//
// 		//create marker options
// 		var geojsonMarkerOptions = {
// 			radius: 8,
// 			fillColor: "#D71920",
// 			color: "#D71920",
// 			weight: 1,
// 			opacity: 1,
// 			fillOpacity: 0.8
// 		};
//
// 		//Example 1.2 line 13...create a Leaflet GeoJSON layer and add it to the map
//     L.geoJson(data, {
// 				//onEachFeature: onEachFeature,	old way of doing popups
//         pointToLayer: function (feature, latlng) {
//             //Step 5: For each feature, determine its value for the selected attribute
// 						if(typeof feature.properties[attribute] == "number"){
// 								var attValue = Number(feature.properties[attribute]);
// 						}
//
// 						//Step 6: Give each feature's circle marker a radius based on its attribute value
//           	geojsonMarkerOptions.radius = calcPropRadius(attValue);
//
//             //create circle markers
// 						if(radius > 0){
// 								return L.circleMarker(latlng, geojsonMarkerOptions);
// 						}
//         }
//     }).addTo(map);
// };


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
			if (layer.feature && layer.feature.properties[attribute]){
					//access feature properties
					var props = layer.feature.properties;

					//update each feature's radius based on new attribute values
					var radius = calcPropRadius(props[attribute]);
					layer.setRadius(radius);

					//add city to popup content string
					var popupContent = "<h3><b>" + props.Province + "</b></h3>";
					console.log(props);
					//add formatted attribute to panel content string
					var year = attribute;
					popupContent += "<p><b>" + year + ":</b> " + props[attribute] + " strikes</p>";

					//var popupContent = "<h3><b>" + feature.properties.Province + "</b></h3><p><b>" + attribute + ":</b> " + feature.properties[attribute] + " strikes</p>";

					//update popup content
					popup = layer.getPopup();
					popup.setContent(popupContent).update();
				};
    });
};


//Create sequence controls
function createSequenceControls(){
    //create range input element (slider)
		$('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: 49,
        min: 0,
        value: 0,
        step: 1
    });

		//add step buttons
		$('#panel').append('<button class="step" id="reverse">Reverse</button>');
		$('#panel').append('<button class="step" id="forward">Forward</button>');

		$('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

		//click listener for buttons
		$('.step').click(function(){
				//get the old index value
				var index = $('.range-slider').val();

				//increment or decrement depending on button clicked
				if ($(this).attr('id') == 'forward'){
						index++;
						//if past the last attribute, wrap around to first attribute
						index = index > 50 ? 0 : index;
				} else if ($(this).attr('id') == 'reverse'){
						index--;
						//if past the first attribute, wrap around to last attribute
						index = index < 0 ? 50 : index;
				};

				//update slider
				$('.range-slider').val(index);

				//Called in both step button and slider event listener handlers
        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
		});

		//input listener for slider
		$('.range-slider').on('input', function(){
				//get the new index value
				var index = $(this).val();
				//Called in both step button and slider event listener handlers
				//pass new attribute to update symbols
				updatePropSymbols(attributes[index]);
		});
};

//function to retrieve the data and place it on the map
function getData(){
		//load the data
		$.getJSON("data/canada-strikes.geojson", function(response){
				//call relevant functions
				processData(response);
				createPropSymbols(response, map, attributes);
				createSequenceControls();
		});
};

// //old way of doing popups
// function onEachFeature(feature, layer) {
//     //no property named popupContent; instead, create html string with all properties
//     var popupContent = "";
//     if (feature.properties) {
//     	for (var property in feature.properties){
//     		popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
//     	}
//         layer.bindPopup(popupContent);
//     };
// };

$(document).ready(createMap);
