
const pmSlider = document.getElementById("minpm");
const benzSlider = document.getElementById("minbenz");
const pmValue = document.getElementById("pmValue");
const benzValue = document.getElementById("benzValue");

let pmLayer; 
let benzeneLayer; 
let fullData;      // for storing full GeoJSON for filtering

const map1 = L.map('map1',{fullscreenControl: true}).setView([40.7128, -74.0060], 12);
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map1);
var alidade_smooth_dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map1);

//const map2 = L.map('map2',{fullscreenControl: true}).setView([40.7128, -74.0060], 12);
//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  attribution: '© OpenStreetMap contributors'
//}).addTo(map2);

// Popup per feature
function onEachFeature(feature, layer) {
  layer.bindPopup(
    "PM 2.5 Levels: " + (feature.properties.particulate_matter_25 * 100).toFixed(1) + "%" +
    "<br>" +
    "Benzene Levels: " + (feature.properties.benzene_concentration * 100).toFixed(1) + "%"+
    "<br>" + "------------------------------" + "<br>" +
    "Traffic Truck Highway Levels: " + (feature.properties.traffic_truck_highways * 100).toFixed(1) + "%" +
    "<br>" +
    "Traffic Number Vehicles Levels: " + (feature.properties.traffic_number_vehicles * 100).toFixed(1) + "%" +
    "<br>" + "------------------------------" + "<br>" +
    "Asthma ED Rate Levels: " + (feature.properties.asthma_ed_rate* 100).toFixed(1) + "%"+
    "<br>" +
    "COCPD ED Rate Levels: " + (feature.properties.copd_ed_rate * 100).toFixed(1) + "%"

  );
  //hover color change
  layer.on("mouseover", (e) => {
    e.target.setStyle({
      fillColor: '#fffff',
      color: '#333',
      fillOpacity: 0.2,
      weight: 0.5
    });
  });
  layer.on("mouseout", (e) => {
    benzeneLayer.resetStyle(e.target);
    pmLayer.setStyle(getPmStyle);
    trafficTruckHighwaysLayer.setStyle(getthwayStyle);
  });
}
function getthwayStyle(feature) {
    const tt = feature.properties.traffic_truck_highways;
    return {
    fillColor: tt > .75 ? '#CB1212' :
                tt > .5 ? '#656C2D' :
                tt > .25 ? '#76C244' :
                '#FFEDA0',
    weight: 0.25,
    color: "#333",
    fillOpacity: 0.9
    };
}
function getttnv(feature) {
    const pm = feature.properties.particulate_matter_25
    return {
    fillColor: pm > .75 ? '#CB1212' :
                pm > .5 ? '#656C2D' :
                pm > .25 ? '#76C244' :
                '#FFEDA0',
    weight: 0.25,
    color: "#333",
    fillOpacity: 0.9
    };
}
function getBenzStyle(feature) {
    const benz = feature.properties.benzene_concentration;
    return {
    fillColor: benz > .75 ? "#FFFF00" :
                benz > .5 ? "#9933cc" :
                benz > .25 ? "#cc66ff" :
                "#e0ccff",
    weight: 0.25,
    color: "#333",
    fillOpacity: 0.9
    };
}

function getPmStyle(feature) {
    const pm = feature.properties.particulate_matter_25
    return {
    fillColor: pm > .75 ? '#CB1212' :
                pm > .5 ? '#656C2D' :
                pm > .25 ? '#76C244' :
                '#FFEDA0',
    weight: 0.25,
    color: "#333",
    fillOpacity: 0.9
    };
}
function getPmStyle(feature) {
    const pm = feature.properties.particulate_matter_25
    return {
    fillColor: pm > .75 ? '#CB1212' :
                pm > .5 ? '#656C2D' :
                pm > .25 ? '#76C244' :
                '#FFEDA0',
    weight: 0.25,
    color: "#333",
    fillOpacity: 0.9
    };
}
// Filtering logic
function filterCitiesByPmAndbenz(data, filters) {
  return {
    type: "FeatureCollection",
    features: data.features.filter(feature => {
      const pm = feature.properties.particulate_matter_25;
      const benz = feature.properties.benzene_concentration;
      return pm >= filters.minpm && benz >= filters.minbenz;
    })
  };
}

// Update map when sliders move
function updateMapFilters() {
  if (!fullData || !pmLayer) return;
  
  const cityFilters = {
    minpm: parseFloat(pmSlider.value),
    minbenz: parseFloat(benzSlider.value)
  };

  const filteredData = filterCitiesByPmAndbenz(fullData, cityFilters);

  pmLayer.clearLayers();
  pmLayer.addData(filteredData);
  benzeneLayer.clearLayers();
  benzeneLayer.addData(filteredData);
  if (filteredData.features.length > 0) {
    map1.fitBounds(pmLayer.getBounds());
  }
}

pmSlider.addEventListener("input", () => {
  pmValue.textContent = pmSlider.value;
  updateMapFilters();
});

benzSlider.addEventListener("input", () => {
  benzValue.textContent = benzSlider.value;
  updateMapFilters();
});

// Load GeoJSON and store it for filtering
$.getJSON('data/fdc_2023.geojson', function (data) {
    fullData = data;
    //pm and 2.5 layers
    pmLayer = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        style: getPmStyle,
    }).bindTooltip((l) => {
        return l.feature.properties.city_town + " County";
    }).addTo(map1); 
    benzeneLayer = L.geoJSON(data, {
        style: getBenzStyle,
        onEachFeature: onEachFeature
    }).bindTooltip((l) => {
        return l.feature.properties.city_town + " County";
    }).addTo(map1);
    //traffic_truck_highways/traffic_number_vehicles
    trafficTruckHighwaysLayer = L.geoJSON(data, {
        style: getthwayStyle,
        onEachFeature: onEachFeature
    }).bindTooltip((l) => {
        return l.feature.properties.city_town + " County";
    }).addTo(map1);
    map1.fitBounds(pmLayer.getBounds());

    const overlays = {
        "PM 2.5 Layer": pmLayer,
        "Benzene Layer": benzeneLayer,
        "Traffic Truck Highway Layer": trafficTruckHighwaysLayer
    };
    var baseLayers = {
        "Alidade Smooth Dark": alidade_smooth_dark,
        "OpenStreetMap": osm
      };
    L.control.layers(baseLayers, overlays).addTo(map1);
});


