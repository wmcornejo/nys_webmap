# Final WebGIS Project: Visualizing Disadvantaged Communities in New York State

Link: https://wmcornejo.github.io/nys_webmap/

## Project Goal 
Visualize causes and effects of PM2.5 and Benzene across Disadvantaged Communities (DACs) in New York State using spatial data from NYSERDA (2023).

## Data:
### NYSERDA FINAL Disadvantaged Communities (DAC) 2023: 
- GEOJSON file  that identifies areas throughout the State that meet the final disadvantaged community definition as
voted on by the Climate Justice Working Group on March 27th, 2023. At census tract level.

### PM2.5:
- Particulate Matter, fine inhalable particles with a diameter of 2.5 micrometers or less (Human hair 50-70 micrometers)
- Can come from construction sites, unpaved roads, fields, smokestacks or fires.
- Can get deep into your lungs and even get into your bloodstream.

### Benzene:
- Cancer causing substance per the NCI. At room temp it is a liquid chemical and is an intermediate material in the creation of gasoline.
- Ways people are exposed through industrial or vehicle emissions, or second hand smoking.

## Methods:

### Data Preparation
- Observable: look at column names, explore data.
- QGIS: clip region, join NTA name to census tracts, symbology values. ex - getPmStyle().
- Different folders: split css, html and js to their own files.


### Functions
- Layer Changing: 
    - refresh the data layer based on layer selected.
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
    - setSty()
- Search: 
    - search census tracts by city_town.
    - search(), using animated search box to get input and fuse to link it to the data.


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

Sources:
- https://www.epa.gov/pm-pollution/particulate-matter-pm-basics
- https://www.cancer.gov/about-cancer/causes-prevention/risk/substances/benzene
- https://data.ny.gov/Energy-Environment/Final-Disadvantaged-Communities-DAC-2023/2e6c-s6fp/about_data 