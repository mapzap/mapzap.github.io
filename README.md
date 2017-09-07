# Mapzap

Build responsive web mapping applications via URL parameters.

A simple, lightweight tool for quickly standing up responsive web mapping applications (mapzaps) _without having to write any code_. Built on the [Google Maps JavaScript API](https://developers.google.com/maps/web/), this utility lets you configure your settings via simple URL parameters. Feed it a source data file in GeoJSON format (or CSV with `latitude` & `longitude` columns), give it a title, icon, and tell it which data fields you want to show, and you get a responsive, mobile-friendly "mapzap" for viewing and interacting with your data. Your mapzap can be shared, embedded into websites and blogs, and added to your mobile device's homescreen for a native, full screen experience. Use [geojson.io](http://geojson.io/), [GeoEditor](https://geoeditor.maptiler.com) [QGIS](https://www.qgis.org/) or any other modern mapping tool to generate your GeoJSON, place it on a web server, push it to GitHub, Google Drive, Dropbox, etc. or save it as a Gist and quickly wrap it up as a responsive web app.

### Features:

- Fullscreen mobile-friendly map app with responsive navbar, modal popups, and map/table views
- Built on the incredibly popular [Bootstrap](http://getbootstrap.com/) and [Google Maps](https://developers.google.com/maps/web/) frameworks
- Configure everything via URL parameters (no coding necessary)!
- Define data source, app title, icon, display fields/properties & data attribution
- Completely client-side, can be hosted for free on [GitHub Pages](https://pages.github.com/)
- Supports custom feature styling and [StreetView](https://www.google.com/streetview/understand/) integration
- Interactive feature table with filtering, sorting, and column toggling via [Bootstrap Table](http://bootstrap-table.wenzhixin.net.cn/)

### Examples:

- [DC WiFi Social](https://bmcbride.github.io/mapzap/?src=https://raw.githubusercontent.com/benbalter/dc-wifi-social/master/bars.geojson&fields=name,address&title=DC%20WiFi%20Social&sortfield=name&attribution=https://github.com/benbalter/dc-wifi-social) A GitHub based collaborative list of DC locations that serve up both Internet and Alcohol from [Ben Balter](https://github.com/benbalter/dc-wifi-social)
- [US States](https://bmcbride.github.io/mapzap/?src=https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson&icon=https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png&fields=name,name_alt,adm1_code,region,wikipedia&sortfield=name&title=US%20States&attribution=States%20courtesy%20of%20geojson.xyz) Natural Earth _admin 1 states provinces shp_ data from [http://geojson.xyz/](http://geojson.xyz/)
- [Football Clubs of Europe](https://bmcbride.github.io/mapzap/?src=https://web.fulcrumapp.com/shares/82982e4c55707a34.geojson&fields=name,full_name,ground,league,city,state_province,country,photo&title=Football%20Clubs%20of%20Europe&sortfield=name&attribution=Courtesy%20of%20Coleman%20McCormick) A Fulcrum mapping project from [Coleman McCormick](https://github.com/colemanm/)
- [NYC Coffee Shops](https://bmcbride.github.io/mapzap/?src=https://api.tiles.mapbox.com/v3/mapbox.o11ipb8h/markers.geojson&fields=name,description&title=NYC%20Coffee%20Shops&sortfield=name&attribution=Courtesy%20of%20Mapbox) via [Mapbox](https://www.mapbox.com/blog/open-web-geojson/)
- [Baseball Parks](https://bmcbride.github.io/mapzap/?src=https://raw.githubusercontent.com/cageyjames/GeoJSON-Ballparks/master/ballparks.geojson&fields=Ballpark,Team,League,Class&title=GeoJSON%20Ballparks&sortfield=Ballpark&attribution=https://github.com/cageyjames/GeoJSON-Ballparks&style={%22icon%22:{%22path%22:0,%22scale%22:4,%22strokeColor%22:%22white%22,%22strokeWeight%22:1,%22fillColor%22:%22orange%22,%22fillOpacity%22:1}}) A GeoJSON Ballpark mapping project from [James Fee](https://github.com/cageyjames/GeoJSON-Ballparks)

### URL Parameters:

| Parameter     | Options                     | Description                                             | Required | Default           |
| ------------- | --------------------------- | ------------------------------------------------------- | -------- | ----------------- |
| _src_         | GeoJSON or CSV              | URL to web accessible GeoJSON or CSV file               | True     | NA                |
| _title_       | Any string                  | navbar, app title                                       | False    | Mapps Data Viewer |
| _icon_        | Image (PNG, JPG)            | URL to accessible image for custom navbar icon          | False    | NA                |
| _fields_      | Any valid properties        | Comma separated list of specific properties to show     | False    | All               |
| _sortfield_   | Any valid property          | Initially sort table by this column                     | False    | NA                |
| _sortorder_   | asc / desc                  | Initial column sort order                               | False    | asc               |
| _attribution_ | Any string (URLs supported) | Source attribution added to text in bottom right of map | False    | NA                |
| _map_         | Any valid map type          | Google map type (roadmap, satellite, hybrid, terrain)   | False    | roadmap           |
| _style_       | JSON style options          | Feature style rules- see examples below                 | False    | `{fillColor:"red","fillOpacity":"0.2","strokeColor":"red","strokeOpacity":"1","strokeWeight":"2"}` |

### JSON Style Options:

Feature styling per the [google.maps.Data.StyleOptions](https://developers.google.com/maps/documentation/javascript/3.exp/reference#Data.StyleOptions) object specification. You can also categorically style features by defining an object with `property` and `values` properties. Values should be an object of values and corresponding CSS3 colors or URLs to marker images.

#### Single Style Example (SVG symbols)

```js
{
  "fillColor": "blue",
  "fillOpacity": 0.2,
  "strokeColor": "blue",
  "strokeOpacity": 1,
  "strokeWeight": 2,
  "icon": {
    "path": 0,
    "scale": 7,
    "strokeColor": "white",
    "strokeWeight": 1,
    "fillColor": "blue",
    "fillOpacity": 1
  }
}
```

#### Single Style Example (Image marker)

```js
{
  "icon": "https://maps.gstatic.com/mapfiles/ms/micons/blue.png"
}
```

#### Categorized Style Example (SVG symbols)

```js
{
  "property": "degree_of_damage",
  "values": {
    "Destroyed": "#DA0796",
    "Major": "#CB0D0C",
    "Minor": "#FF8819",
    "Affected": "#FFD300",
    "Inaccessible": "#B3B3B3",
    "No Visible Damage": "#87D30F"
  }
}
```

#### Categorized Style (Image markers)

```js
{
  "property": "degree_of_damage",
  "values": {
    "Destroyed": "https://maps.gstatic.com/mapfiles/ms/micons/pink.png",
    "Major": "https://maps.gstatic.com/mapfiles/ms/micons/red.png",
    "Minor": "https://maps.gstatic.com/mapfiles/ms/micons/orange.png",
    "Affected": "https://maps.gstatic.com/mapfiles/ms/micons/yellow.png",
    "Inaccessible": "https://maps.gstatic.com/mapfiles/ms/micons/grey.png",
    "No Visible Damage": "https://maps.gstatic.com/mapfiles/ms/micons/green.png"
  }
}
```
