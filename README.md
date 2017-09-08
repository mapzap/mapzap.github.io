# Mapzap

Build custom responsive web mapping applications without any coding!

A simple, lightweight tool for quickly standing up responsive web mapping applications (mapzaps) _without having to write any code_. Built on the [Google Maps JavaScript API](https://developers.google.com/maps/web/), this utility lets you configure your settings via simple URL parameters. Feed it a source data file in GeoJSON format (or CSV with `latitude` & `longitude` columns), give it a title, icon, and tell it which data fields you want to show, and you get a responsive, mobile-friendly "mapzap" for viewing and interacting with your data. Your mapzap can be shared, embedded into websites and blogs, and added to your mobile device's homescreen for a native, full screen experience. Use [geojson.io](http://geojson.io/), [GeoEditor](https://geoeditor.maptiler.com), [Fulcrum](http://www.fulcrumapp.com/), [QGIS](https://www.qgis.org/) or any other modern mapping tool to generate your GeoJSON, place it on a web server, push it to GitHub, Google Drive, Dropbox, etc. or save it as a Gist and quickly wrap it up as a responsive web app.

### Get Started

Use the [Builder Tool](https://bmcbride.github.io/mapzap/build.html) to quickly build your Mapzap!

You can also download or fork this repo and host your own version. If you self-host, please use your own Google Maps API key.

### Features

- Fullscreen mobile-friendly web app with responsive navbar, modal popups, and map/table/split views.
- Built on the incredibly popular [Bootstrap](http://getbootstrap.com/) and [Google Maps](https://developers.google.com/maps/web/) frameworks.
- Configure everything via URL parameters (no coding necessary)!
- Define data source, app title, icon, display fields/properties & data attribution manually or with the [Builder Tool](https://bmcbride.github.io/mapzap/build.html).
- Completely client-side, can be hosted for free on [GitHub Pages](https://pages.github.com/)
- Supports custom feature styling and [StreetView](https://www.google.com/streetview/understand/) integration
- Interactive feature table with filtering, sorting, and column toggling via [Bootstrap Table](http://bootstrap-table.wenzhixin.net.cn/)

### Screenshots

#### Mapz
![Mobile](https://bmcbride.github.io/mapzap/screenshots/mobile.png)

#### Builder
![Builder](https://bmcbride.github.io/mapzap/screenshots/builder.png)

### Examples

- [DC WiFi Social](https://bmcbride.github.io/mapzap/?src=https://raw.githubusercontent.com/benbalter/dc-wifi-social/master/bars.geojson&fields=name,address&title=DC%20WiFi%20Social&sortfield=name&attribution=https://github.com/benbalter/dc-wifi-social) A GitHub based collaborative list of DC locations that serve up both Internet and Alcohol from [Ben Balter](https://github.com/benbalter/dc-wifi-social)
- [US States](https://bmcbride.github.io/mapzap/?src=https%3A%2F%2Fd2ad6b4ur7yvpq.cloudfront.net%2Fnaturalearth-3.3.0%2Fne_110m_admin_1_states_provinces_shp.geojson&icon=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fen%2Fthumb%2Fa%2Fa4%2FFlag_of_the_United_States.svg%2F320px-Flag_of_the_United_States.svg.png&title=US%20States&fields=region%2Cname%2Cname_alt%2Cadm1_code%2Cwikipedia&attribution=http%3A%2F%2Fgeojson.xyz&map=roadmap&sortfield=name&sortorder=asc&style=%7B%0A%20%20%22property%22%3A%20%22region%22%2C%0A%20%20%22values%22%3A%20%7B%0A%20%20%20%20%22West%22%3A%20%22%23DA0796%22%2C%0A%20%20%20%20%22South%22%3A%20%22%23CB0D0C%22%2C%0A%20%20%20%20%22Northeast%22%3A%20%22%23FF8819%22%2C%0A%20%20%20%20%22Midwest%22%3A%20%22%23FFD300%22%0A%20%20%7D%0A%7D) Natural Earth _admin 1 states provinces shp_ data from [http://geojson.xyz/](http://geojson.xyz/)
- [Football Clubs of Europe](https://bmcbride.github.io/mapzap/?src=https://web.fulcrumapp.com/shares/82982e4c55707a34.geojson&fields=name,full_name,ground,league,city,state_province,country,photo&title=Football%20Clubs%20of%20Europe&sortfield=name&attribution=Courtesy%20of%20Coleman%20McCormick) A Fulcrum mapping project from [Coleman McCormick](https://github.com/colemanm/)
- [NYC Coffee Shops](https://bmcbride.github.io/mapzap/?src=https://api.tiles.mapbox.com/v3/mapbox.o11ipb8h/markers.geojson&fields=name,description&title=NYC%20Coffee%20Shops&sortfield=name&attribution=Courtesy%20of%20Mapbox) via [Mapbox](https://www.mapbox.com/blog/open-web-geojson/)
- [Baseball Parks](https://bmcbride.github.io/mapzap/?src=https://raw.githubusercontent.com/cageyjames/GeoJSON-Ballparks/master/ballparks.geojson&fields=Ballpark,Team,League,Class&title=GeoJSON%20Ballparks&sortfield=Ballpark&attribution=https://github.com/cageyjames/GeoJSON-Ballparks&style={%22icon%22:{%22path%22:0,%22scale%22:4,%22strokeColor%22:%22white%22,%22strokeWeight%22:1,%22fillColor%22:%22orange%22,%22fillOpacity%22:1}}) A GeoJSON Ballpark mapping project from [James Fee](https://github.com/cageyjames/GeoJSON-Ballparks)

### URL Parameters

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

### JSON Style Options

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
