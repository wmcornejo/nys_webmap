
const pmSlider = document.getElementById("minpm");
const benzSlider = document.getElementById("minbenz");
const pmValue = document.getElementById("pmValue");
const benzValue = document.getElementById("benzValue");

let pmLayer; 
let benzeneLayer; 
let fullData;      // for storing full GeoJSON for filtering
let activeCityLayer = null; // 
let lastHighlightedLayer = null;

const map1 = L.map('map1',{fullscreenControl: true}).setView([40.74281318841831, -73.92931873140857], 11);
//var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//  attribution: '© OpenStreetMap contributors'
//}).addTo(map1);
var cartodb_positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map1);
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'info legend');
  // Example breaks and colors for PM2.5
  const grades = [0, 0.48, 0.62, 0.75, 0.87];
  const colors = ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'];

  div.innerHTML += '<b>PM 2.5 Score</b><br>';
  // loop through intervals and generate a label with a colored square for each interval
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      `<i style="background:${colors[i]};width:18px;height:18px;display:inline-block;margin-right:8px;"></i> ` +
      `${grades[i]}${grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+'}`;
  }
  return div;
};

legend.addTo(map1);

function updateLegend(layerKey) {
  // Define breaks/colors for each layer
  const legends = {
    pm: { title: 'PM 2.5 Score', grades: [0, 0.48, 0.62, 0.75, 0.87], colors: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'] },
    benz: { title: 'Benzene Score', grades: [0, 0.4, 0.59, 0.73, 0.86], colors: ['#fee5d9', '#fcae91', '#fb6a4a', '#cb181d', '#99000d'] },
    ttraf: { title: 'Number Of Vehicles Score', grades: [0, 0.27, 0.47, 0.65, 0.83], colors: ['#e5f5f9', '#ccece6', '#66c2a4', '#238b45', '#00441b'] },
    tthwy: { title: 'Highway Truck Traffic Score', grades: [0, 0.29, 0.5, 0.67, 0.84], colors: ['#e5f5f9', '#ccece6', '#66c2a4', '#238b45', '#00441b'] },
    asthma: { title: 'Asthma ED Rate Score', grades: [0, 0.23, 0.45, 0.66, 0.84], colors: ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'] },
    cocpd: { title: 'COPD ED Rate Score', grades: [0, 0.14, 0.3, 0.48, 0.67], colors: ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'] }
  };
  const legendData = legends[layerKey];
  if (!legendData) return;
  const div = document.querySelector('.info.legend');
  div.innerHTML = `<b>${legendData.title}</b><br>`;
  for (let i = 0; i < legendData.grades.length; i++) {
    div.innerHTML +=
      `<i style="background:${legendData.colors[i]};width:18px;height:18px;display:inline-block;margin-right:8px;"></i> ` +
      `${legendData.grades[i]}${legendData.grades[i + 1] ? ' &ndash; ' + legendData.grades[i + 1] + '<br>' : '+'}`;
  }
}


function onEachFeature(feature, layer) {
    const props = feature.properties;
    // Tooltip content (can be simplified or kept as a table)
    const tooltipContent = `
      <table class="popup-table">
        <tr><th colspan="2"><b>${props.city_town}</b></th></tr>
        <tr><th>PM 2.5</th><td class="${getLevelColorClass(props.particulate_matter_25)}">${(props.particulate_matter_25 * 100).toFixed(1)}%</td></tr>
        <tr><th>Benzene</th><td class="${getLevelColorClass(props.benzene_concentration)}">${(props.benzene_concentration * 100).toFixed(1)}%</td></tr>
        <tr><th>Highway Truck Traffic</th><td class="${getLevelColorClass(props.traffic_truck_highways)}">${(props.traffic_truck_highways * 100).toFixed(1)}%</td></tr>
        <tr><th>Vehicle Count</th><td class="${getLevelColorClass(props.traffic_number_vehicles)}">${(props.traffic_number_vehicles * 100).toFixed(1)}%</td></tr>
        <tr><th>Asthma ED Rate</th><td class="${getLevelColorClass(props.asthma_ed_rate)}">${(props.asthma_ed_rate * 100).toFixed(1)}%</td></tr>
        <tr><th>COPD ED Rate</th><td class="${getLevelColorClass(props.copd_ed_rate)}">${(props.copd_ed_rate * 100).toFixed(1)}%</td></tr>
      </table>
    `;
    layer.bindTooltip(tooltipContent, {
      direction: "top",
      sticky: true,
      className: "custom-tooltip"
    });

    layer.on("mouseover", (e) => {
        e.target.setStyle({
          fillColor: '#f01673',
          color: '#333',
          fillOpacity: 0.2,
          weight: 0.5
        });
        e.target.bringToFront();
    });

    layer.on("mouseout", (e) => {
        const layer = e.target;
        layer.setStyle(currentStyleFn(layer.feature));
    });

    // Show stats and charts on click
    layer.on("click", () => {
        zoomToCityFeature(feature, layer);
    });
}


// Style functions
function getthwayStyle(feature) {
    const tt = feature.properties.traffic_truck_highways;
    return {
    fillColor: tt > .83 ? '#00441b' :
                tt > .65 ? '#238b45' :
                tt > .47 ? '#66c2a4' :
                tt > .27 ? '#ccece6' :
                '#e5f5f9',
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}
function getttnv(feature) {
    const pm = feature.properties.traffic_number_vehicles
    return {
    fillColor: pm > .84 ? '#00441b' :
                pm > 0.67 ? '#238b45' :
                pm > .5 ? '#66c2a4' :
                pm > .29 ? '#ccece6' :
                '#e5f5f9',
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}

function getBenzStyle(feature) {
    const benz = feature.properties.benzene_concentration;
    return {
    fillColor: benz > .86 ? "#99000d" :
                benz > .73 ? "#cb181d" :
                benz > .59 ? "#fb6a4a" :
                benz > .4 ? "#fcae91" :
                "#fee5d9",
    weight: 0.15,
    color: "#333",
    fillOpacity: 0.9
    };
}

function getPmStyle(feature) {
    const pm = feature.properties.particulate_matter_25;
    return {
        fillColor: pm > 0.87 ? '#a63603' :         
                   pm > 0.75 ? '#e6550d' :
                   pm > 0.62 ? '#fd8d3c' :
                   pm > 0.48 ? '#fdbe85' :
                              '#feedde',         
        weight: 0.15,
        color: "#333",
        fillOpacity: 0.9
    };
}

function getasthma(feature) {
    const pm = feature.properties.asthma_ed_rate;
    return {
        fillColor: pm > 0.84 ? '#006837' :        
                   pm > 0.66 ? '#31a354' :
                   pm > 0.45 ? '#78c679' :
                   pm > 0.23 ? '#c2e699' :
                              '#ffffcc',       
        weight: 0.15,
        color: "#333",
        fillOpacity: 0.9
    };
}


function getcocpd(feature) {
    const pm = feature.properties.copd_ed_rate;
    return {
        fillColor: pm > 0.67 ? '#7a0177' :  
                   pm > 0.48 ? '#c51b8a' :
                   pm > 0.3 ? '#f768a1' :
                   pm > 0.14 ? '#fbb4b9' :
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
  dataLayer.setStyle(currentStyleFn);
}

pmSlider.addEventListener("input", debounce(() => {
  pmValue.textContent = pmSlider.value;
  updateMapFilters();
}, 150));

benzSlider.addEventListener("input", debounce(() => {
  benzValue.textContent = benzSlider.value;
  updateMapFilters();
}, 150));

let dataLayer;
let currentStyleFn = getPmStyle;
//dataLayer.setTooltipContent = onEachFeature();
$.getJSON('data/nta_fdc_b.geojson', function (data) {
    // Load GeoJSON data
    fullData = data;

  dataLayer = L.geoJSON(data, {
    style: getPmStyle,
    onEachFeature: onEachFeature,
  }).addTo(map1);



  const styleMap = {
    pm: getPmStyle,
    benz: getBenzStyle,
    ttraf: getttnv,
    tthwy: getthwayStyle,
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
        updateLegend(styleKey);
      }
    });
  });


    //map1.fitBounds(dataLayer.getBounds());

    const searchbox = L.control.searchbox({
        position: 'topright',
        expand: 'left'
    }).addTo(map1);


    const cities = fullData.features.map(f => f.properties.city_town);
    const fuse = new Fuse(cities, {
        shouldSort: true,
        // moderate threshold for autocomplete
        threshold: 0.4,
        minMatchCharLength: 2
      });
      // suggests user input when user types in searchbox
      searchbox.onInput("keyup", function (e) {
        const value = searchbox.getValue();
        if (value !== "") {
          const results = fuse.search(value);
          const items = results.map(res => res.item).slice(0, 5);
          searchbox.setItems(items);

          // Add click event to each dropdown item
          setTimeout(() => {
            document.querySelectorAll('.leaflet-searchbox-suggestion').forEach((item, idx) => {
              item.onclick = () => {
                zoomToCity(items[idx]);
              };
            });
          }, 0);
        } else {
          searchbox.clearItems();
        }
      });

      function zoomToCityFeature(feature, layer) {
        // Reset previous highlight if any
        if (lastHighlightedLayer) {
          lastHighlightedLayer.setStyle(currentStyleFn(lastHighlightedLayer.feature));
        }

        // Store original style for animation
        const originalStyle = currentStyleFn(layer.feature);

        // Animate highlight: from yellow back to original color
        let step = 0;
        const steps = 200;
        function animateHighlight() {
          step++;
          const color = interpolateColor('#ffff00', originalStyle.fillColor, step / steps);
          layer.setStyle({
            ...originalStyle,
            fillColor: color
          });
          if (step < steps) {
            requestAnimationFrame(animateHighlight);
          } else {
            layer.setStyle(originalStyle);
          }
        }
        layer.setStyle({
          ...originalStyle,
          fillColor: '#ffff00'
        });
        animateHighlight();

        lastHighlightedLayer = layer;

        // Zoom to bounds
        if (layer.getBounds) {
          map1.flyToBounds(layer.getBounds(), {
            padding: [50, 50],
            maxZoom: 15,
            animate: true,
            duration: 1.5
          });
        }

        // Show popup with charts
        const props = feature.properties;
        const popupContent = `
          <table class="popup-table_1">
            <tr><th colspan="2"><b>${props.city_town}</b></th></tr>
            <tr>
              <td>
                <canvas id="popupScatter${props.city_town.replace(/\s/g, '')}" width="180" height="180"></canvas>
              </td>
              <td>
                <canvas id="popupPie${props.city_town.replace(/\s/g, '')}" width="180" height="180"></canvas>
              </td>
            </tr>
            <!-- ...rest of your table rows... -->
          </table>
        `;
        layer.bindPopup(popupContent, { maxWidth: 400 }).openPopup();
      }

      // Refactor search to use zoomToCityFeature
      function zoomToCity(cityName) {
        // Find the feature in your data
        const match = fullData.features.find(f =>
          f.properties.city_town.toLowerCase() === cityName.toLowerCase()
        );
        if (!match) return;

        // Find the corresponding Leaflet layer in dataLayer
        let targetLayer = null;
        dataLayer.eachLayer(layer => {
          if (
            layer.feature &&
            layer.feature.properties.city_town.toLowerCase() === cityName.toLowerCase()
          ) {
            targetLayer = layer;
          }
        });

        if (targetLayer) {
          zoomToCityFeature(match, targetLayer);
        }
      }

      // Helper: interpolate between two hex colors
      function interpolateColor(color1, color2, factor) {
        // factor: 0 = color1, 1 = color2
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const result = [
          Math.round(c1[0] + (c2[0] - c1[0]) * factor),
          Math.round(c1[1] + (c2[1] - c1[1]) * factor),
          Math.round(c1[2] + (c2[2] - c1[2]) * factor)
        ];
        return `rgb(${result[0]},${result[1]},${result[2]})`;
      }
      function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
      }
      // search user input when magnifying glass is clicked
    searchbox.onButton("click", search);
    // search function
    function search() {
      const value = searchbox.getValue();
      if (value !== "") {
        const match = fullData.features.find(f =>
          f.properties.city_town.toLowerCase() === value.toLowerCase()
        );

        if (match) {
          zoomToCity(value);
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

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

map1.on('popupopen', function(e) {
  const props = e.popup._source.feature.properties;
  const scatterId = `popupScatter${props.city_town.replace(/\s/g, '')}`;
  const pieId = `popupPie${props.city_town.replace(/\s/g, '')}`;
  const scatterCtx = document.getElementById(scatterId);
  const pieCtx = document.getElementById(pieId);

  if (scatterCtx) {
    new Chart(scatterCtx, {
      type: 'bar',
      data: {
        datasets: [{
          label: 'Pollutants',
          data: [
            { x: 'PM2.5', y: props.particulate_matter_25 },
            { x: 'Dataset Average', y: 0.5000276968871378}
          ],
          backgroundColor: ['#fd8d3c', '#7a0177']
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: false
      }
    });
  }
  // I want a pie chart that shows the percentage of each demographic factor
  // in the popu
  if (pieCtx) {
    const sum_of_above =
      props.asian_percent +
      props.latino_percent +
      props.black_african_american_percent +
      props.native_indigenous;
    new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Asian', 'Latino', 'Black', 'Native/Indigenous', 'Other'],
        datasets: [{
          data: [
            props.asian_percent,           // 98.5%
            props.latino_percent,          // 77.5%
            props.black_african_american_percent, //34.8%
            props.native_indigenous,       // 0.83%
            100 - sum_of_above             // to fill out 100%
          ],
          backgroundColor: ['#fd8d3c', '#fb6a4a', '#31a354', '#7a0177']
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: false
      }
    });
  }
});