
const pmSlider = document.getElementById("minpm");
const benzSlider = document.getElementById("minbenz");
const pmValue = document.getElementById("pmValue");
const benzValue = document.getElementById("benzValue");

let pmLayer; 
let benzeneLayer; 
let fullData;      // for storing full GeoJSON for filtering

const map1 = L.map('map1',{fullscreenControl: true}).setView([40.7128, -74.0060], 12);
//var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  attribution: '© OpenStreetMap contributors'
//}).addTo(map1);
var cartodb_positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map1);

//const map2 = L.map('map2',{fullscreenControl: true}).setView([40.7128, -74.0060], 12);
//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  attribution: '© OpenStreetMap contributors'
//}).addTo(map2);

// Popup per feature
function onEachFeature(feature, layer) {
    const props = feature.properties;

    layer.bindPopup(`
      <table class="popup-table">
        <tr><th colspan="2"><b>${props.city_town}</b></th></tr>
        <tr><th>PM 2.5</th><td class="${getLevelColorClass(props.particulate_matter_25)}">${(props.particulate_matter_25 * 100).toFixed(1)}%</td></tr>
        <tr><th>Benzene</th><td class="${getLevelColorClass(props.benzene_concentration)}">${(props.benzene_concentration * 100).toFixed(1)}%</td></tr>
        <tr><th>Truck Traffic</th><td class="${getLevelColorClass(props.traffic_truck_highways)}">${(props.traffic_truck_highways * 100).toFixed(1)}%</td></tr>
        <tr><th>Vehicle Count</th><td class="${getLevelColorClass(props.traffic_number_vehicles)}">${(props.traffic_number_vehicles * 100).toFixed(1)}%</td></tr>
        <tr><th>Asthma ED Rate</th><td class="${getLevelColorClass(props.asthma_ed_rate)}">${(props.asthma_ed_rate * 100).toFixed(1)}%</td></tr>
        <tr><th>COPD ED Rate</th><td class="${getLevelColorClass(props.copd_ed_rate)}">${(props.copd_ed_rate * 100).toFixed(1)}%</td></tr>
      </table>
    `);
  //hover color change
  layer.on("mouseover", (e) => {
    e.target.setStyle({
      fillColor: '#fffff',
      color: '#333',
      fillOpacity: 0.2,
      weight: 0.5
    });
    e.target.bringToFront();
  });
  layer.on("mouseout", (e) => {
    benzeneLayer.resetStyle(e.target);
    pmLayer.setStyle(getPmStyle);
    trafficTruckHighwaysLayer.setStyle(getthwayStyle);
    traffic_number_vehiclesLayer.setStyle(getttnv);
    asthma_edLayer.setStyle(getasthma);
    cocpd_edLayer.setStyle(getcocpd);
  });
}

// Style functions
function getthwayStyle(feature) {
    const tt = feature.properties.traffic_truck_highways;
    return {
    fillColor: tt > .75 ? '#005a32' :
                tt > .5 ? '#238b45' :
                tt > .25 ? '#66c2a4' :
                '#e5f5f9',
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}
function getttnv(feature) {
    const pm = feature.properties.particulate_matter_25
    return {
    fillColor: pm > .75 ? '#005a32' :
                pm > .5 ? '#238b45' :
                pm > .25 ? '#66c2a4' :
                '#e5f5f9',
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}
function getBenzStyle(feature) {
    const benz = feature.properties.benzene_concentration;
    return {
    fillColor: benz > .75 ? "#cb181d" :
                benz > .5 ? "#fb6a4a" :
                benz > .25 ? "#fcae91" :
                "#fee5d9",
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}

function getPmStyle(feature) {
    const pm = feature.properties.particulate_matter_25
    return {
    fillColor: pm > .75 ? '#d94701' :
                pm > .5 ? '#fd8d3c' :
                pm > .25 ? '#fdbe85' :
                '#feedde',
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}
function getasthma(feature) {
    const pm = feature.properties.asthma_ed_rate
    return {
    fillColor: pm > .75 ? '#238443' :
                pm > .5 ? '#78c679' :
                pm > .25 ? '#c2e699' :
                '#ffffcc',
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}

function getcocpd(feature) {
    const pm = feature.properties.copd_ed_rate
    return {
    fillColor: pm > .75 ? '#ae017e' :
                pm > .5 ? '#f768a1' :
                pm > .25 ? '#fbb4b9' :
                '#feebe2',
    weight: 0.15,
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
// for popup
function getLevelColorClass(value) {
    if (value < 0.25) return "popup-green";
    else if (value < 0.5) return "popup-lightgreen";
    else if (value < 0.75) return "popup-yellow";
    else return "popup-red";
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

// Load GeoJSON and add layers
$.getJSON('data/fdc_2023.geojson', function (data) {
    fullData = data;
    //pm and benzene layers
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
    traffic_number_vehiclesLayer = L.geoJSON(data, {
        style: getttnv,
        onEachFeature: onEachFeature
    }).bindTooltip((l) => {
        return l.feature.properties.city_town + " County";
    }).addTo(map1);
    //asthma_ed_rate/copd_ed_rate
    asthma_edLayer = L.geoJSON(data, {
        style: getasthma,
        onEachFeature: onEachFeature
    }).bindTooltip((l) => {
        return l.feature.properties.city_town + " County";
    }).addTo(map1);
    cocpd_edLayer = L.geoJSON(data, {
        style: getcocpd,
        onEachFeature: onEachFeature
    }).bindTooltip((l) => {
        return l.feature.properties.city_town + " County";
    }).addTo(map1);
    map1.fitBounds(pmLayer.getBounds());

    const overlays = {
        "PM 2.5 Layer": pmLayer,
        "Benzene Layer": benzeneLayer,
        "Traffic Truck Highway Layer": trafficTruckHighwaysLayer,
        "Traffic Number Vehicles Layer": traffic_number_vehiclesLayer,
        "Asthma ED Rate Layer": asthma_edLayer,
        "COCPD ED Rate Layer": cocpd_edLayer
    };
    const searchbox = L.control.searchbox({
        placeholder: 'Search for a city/town...',
        position: 'topright',
        expand: 'left'
    }).addTo(map1);
    L.control.layers(overlays, null).addTo(map1);

    const cities = fullData.features.map(f => f.properties.city_town);
    const fuse = new Fuse(cities, {
        shouldSort: true,
        threshold: 0.4,
        minMatchCharLength: 2
      });
      searchbox.onInput("keyup", function (e) {
        if (e.keyCode === 13) {
          search();
        } else {
          const value = searchbox.getValue();
          if (value !== "") {
            const results = fuse.search(value);
            searchbox.setItems(results.map(res => res.item).slice(0, 5));
          } else {
            searchbox.clearItems();
          }
        }
      });
    searchbox.onButton("click", search);
    function search() {
        const value = searchbox.getValue();
        if (value !== "") {
          const match = fullData.features.find(f => 
            f.properties.city_town.toLowerCase() === value.toLowerCase()
          );
      
          if (match) {
            const layer = L.geoJSON(match);
            map1.fitBounds(layer.getBounds());
            L.popup()
              .setLatLng(layer.getBounds().getCenter())
              .setContent(`<b>${match.properties.city_town}</b>`)
              .openOn(map1);
          } else {
            alert("No exact match found.");
          }
        }
      
        setTimeout(() => {
          searchbox.hide();
          searchbox.clear();
        }, 600);
      }
});


