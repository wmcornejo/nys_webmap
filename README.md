Hello!

Here is my web map for my final webGIS course project, visualizing NYSERDA FINAL Disadvantaged Communities data.
Link ->  https://wmcornejo.github.io/nys_webmap/

Data:
NYSERDA FINAL Disadvantaged Communities (DAC) 2023

Methods:

```{ojs}
data = FileAttachment("nta_fdc_b").json()
```
QGIS - clip region, join NTA name to census tracts
OJS - look at column names, explore data
Filtering - 
Search - animated search & fuse plugin

Limitation/Changes:
Observable initally, changed to VSCode
NYS to NYC metro area and Long Island and Upstate
Some areas dont have proper name
Sidebar - collapsible
