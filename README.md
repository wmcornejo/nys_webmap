# Final GTECH 78534 Project: Visualizing Disadvantaged Communities in New York State

Link: https://wmcornejo.github.io/nys_webmap/

## Project Goal 
Visualize causes and effects of PM2.5 and Benzene across census tracts in New York State using spatial data from NYSERDA (2023).

## Data:
### NYSERDA FINAL Disadvantaged Communities (DAC) 2023: 
- GEOJSON file  that identifies areas throughout the state that meet the final disadvantaged community definition as
voted on by the Climate Justice Working Group on March 27th, 2023. At census tract level.
a
### PM2.5:
- Particulate Matter, fine inhalable particles with a diameter of 2.5 micrometers or less (Human hair 50-70 micrometers)
- Can come from concstruction sites, unpaved roads, fields, smokestacks or fires.
- Can get deep into your lungs and even get into your bloodstream.

### Benzene:
- Cancer causing substance per the NCI. At room temp it is a liquid chemical and is an intermediate material in the creation of gasoline.
- People are exposed through industrial or vehicle emissions, or second hand smoking.

## Methods:

### Data Preparation
- Observable: look at column names, explore data.
- QGIS: clip region, join NTA name to census tracts, symbology values. ex - getPmStyle().
- Different folders: split css, html and js to their own files.


### Functions
- Layer Changing: 
    - refresh the data layer based on layer selected with a listener event.
    - document.querySelectorAll('.factor-box').forEach()
    ```{ojs}
        document.querySelectorAll('.factor-box').forEach(box => {
            box.addEventListener('click', () => {
                const styleKey = box.dataset.style;
                const styleFn = styleMap[styleKey];
                if (styleFn) {
                    currentStyleFn = styleFn;
                    dataLayer.setStyle(styleFn);
                }
            });
        });``
    ```
- Filtering: 
    - updateMapFilters() dynamically filters the map based on user input.
    - parses user input from sliders
    - calls filterCitiesbyPmandbenz() to filter the orignal data for new values
    - clears the existing map and adds new layer
    - setStyle()
- Search: 
    - search census tracts by city_town.
    - search(), using animated search box to get input and fuse to link it to the data.

- Popup:
    - getLevelColorClass() for on each feature based on the census tract selected.
    ```{ojs}
    layer.bindPopup(`
      <table class="popup-table">
        <tr><th colspan="2"><b>${props.city_town}</b></th></tr>
        <tr><th>PM 2.5</th><td class="${getLevelColorClass(props.particulate_matter_25)}">${(props.particulate_matter_25 * 100).toFixed(1)}%</td></tr>
        <tr><th>Benzene</th><td class="${getLevelColorClass(props.benzene_concentration)}">${(props.benzene_concentration * 100).toFixed(1)}%</td></tr>
        <tr><th>Highway Truck Traffic</th><td class="${getLevelColorClass(props.traffic_truck_highways)}">${(props.traffic_truck_highways * 100).toFixed(1)}%</td></tr>
        <tr><th>Vehicle Count</th><td class="${getLevelColorClass(props.traffic_number_vehicles)}">${(props.traffic_number_vehicles * 100).toFixed(1)}%</td></tr>
        <tr><th>Asthma ED Rate</th><td class="${getLevelColorClass(props.asthma_ed_rate)}">${(props.asthma_ed_rate * 100).toFixed(1)}%</td></tr>
        <tr><th>COPD ED Rate</th><td class="${getLevelColorClass(props.copd_ed_rate)}">${(props.copd_ed_rate * 100).toFixed(1)}%</td></tr>
      </table>
    `);

    ```
### Plugins

- Fuse Search
- Leaflet.AnimatedSearchBox
- Leaflet.fullscreen

## Limitation/Changes:
- Observable initally, changed to VSCode
- NYS to NYC metro area and Long Island and Upstate
- Some areas dont have proper name
- Sidebar collapsible or not
- Legend
- get level color class should be updated

Sources:
- https://www.epa.gov/pm-pollution/particulate-matter-pm-basics
- https://www.cancer.gov/about-cancer/causes-prevention/risk/substances/benzene
- https://data.ny.gov/Energy-Environment/Final-Disadvantaged-Communities-DAC-2023/2e6c-s6fp/about_data 

---

This project is the final project for *GTECH 78534*, offered at CUNY Hunter College.  
It was also funded by the Masters of GeoInformatics program as part of my mentored research.
