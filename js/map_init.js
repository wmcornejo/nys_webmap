
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
    
    layer.on("mouseover", (e) => {
        e.target.setStyle({
          fillColor: '#ffffff',
          color: '#333',
          fillOpacity: 0.2,
          weight: 0.5
        });
        e.target.bringToFront();
      });
    
      layer.on("mouseout", (e) => {
        const layer = e.target;
        //const newStyle = currentStyleFn(layer.feature); 
        layer.setStyle(currentStyleFn(layer.feature));
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
  if (!fullData || !dataLayer) return;
  
  const cityFilters = {
    minpm: parseFloat(pmSlider.value),
    minbenz: parseFloat(benzSlider.value)
  };

  const filteredData = filterCitiesByPmAndbenz(fullData, cityFilters);

  dataLayer.clearLayers();         
  dataLayer.addData(filteredData);  
}

pmSlider.addEventListener("input", () => {
  pmValue.textContent = pmSlider.value;
  updateMapFilters();
});

benzSlider.addEventListener("input", () => {
  benzValue.textContent = benzSlider.value;
  updateMapFilters();
});

let dataLayer;
let currentStyleFn = getPmStyle;
$.getJSON('data/fdc_2023.geojson', function (data) {
  fullData = data;

  dataLayer = L.geoJSON(data, {
    onEachFeature: onEachFeature,
    style: getPmStyle // default style
  }).addTo(map1);

 
  const styleMap = {
    pm: getPmStyle,
    benz: getBenzStyle,
    ttraf: getthwayStyle,
    tthwy: getttnv,
    asthma: getasthma,
    cocpd: getcocpd,
  };
  
  document.querySelectorAll('.factor-box').forEach(box => {
    box.addEventListener('click', () => {
      const styleKey = box.dataset.style;
      const styleFn = styleMap[styleKey];
      if (styleFn) {
        currentStyleFn = styleFn;
        dataLayer.setStyle(styleFn);
      }
    });
  });


    map1.fitBounds(dataLayer.getBounds());

    const searchbox = L.control.searchbox({
        position: 'topright',
        expand: 'left'
    }).addTo(map1);


    const cities = fullData.features.map(f => f.properties.city_town);
    const counties = fullData.features.map(f => f.properties.county);
    const fuse = new Fuse(counties, {
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
            f.properties.county.toLowerCase() === value.toLowerCase()
          );
      
          if (match) {
            const layer = L.geoJSON(match);
            map1.fitBounds(layer.getBounds(), {
                padding: [50, 50],
                maxZoom: 11
              });
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


