var app = {

  urlParams: {},

  userFields: [],

  bounds: new google.maps.LatLngBounds(),

  infoWindow: new google.maps.InfoWindow(),

  geocoder: new google.maps.Geocoder(),

  autocomplete: new google.maps.places.Autocomplete((document.getElementById("search")), {
    types: ["geocode"]
  }),

  init: function() {
    this.resize();
    this.bindUIActions();
    this.loadURLparams();
    this.buildMap();
    this.initLocationCtrl();

    $(window).resize(function () {
      $("#table").bootstrapTable("resetView", {
        height: $("#table-container").height()
      });
      app.resize();
      google.maps.event.trigger(map, "resize");
    });

    $(".navbar-collapse").on("hidden.bs.collapse", function () {
      $(window).trigger("resize");
    });
  },

  resize: function() {
    $("body").css("padding-top", $(".navbar").css("height"));
  },

  bindUIActions: function() {
    $("#extent-btn").click(function() {
      app.map.fitBounds(app.bounds);
      $(".navbar-collapse").collapse("hide");
      return false;
    });

    $("#download-btn").click(function() {
      $(".navbar-collapse").collapse("hide");
    });

    $("#legend-btn").click(function() {
      $("#legend-modal").modal("show");
      $(".navbar-collapse").collapse("hide");
      return false;
    });

    $("#copy-url-btn").click(function() {
      var copyText = $("#url-input")[0];
      copyText.select();
      document.execCommand("copy");
      alert("Link copied!");
    });

    $("[name='view']").click(function() {
      if (this.id === "split-view-btn") {
        app.switchView("split");
        return false;
      } else if (this.id === "map-view-btn") {
        app.switchView("map");
        return false;
      } else if (this.id === "table-view-btn") {
        app.switchView("table");
        return false;
      }
    });
  },

  loadURLparams: function() {
    app.urlParams = new URLSearchParams(window.location.search);

    if (app.urlParams.has("title")) {
      var title = app.urlParams.get("title");
      $("[name='title']").html(title);
    }

    if (app.urlParams.has("src")) {
      var src = app.urlParams.get("src");
      app.fetchData(src);
      $("#download-btn").attr("href", src);
    } else {
      window.location = window.location.href + "build.html";
      return false;
    }

    if (app.urlParams.has("icon")) {
      var icon = app.urlParams.get("icon");
      $("#navbar-title").prepend("<img src='" + icon + "' height='32' class='d-inline-block align-middle mr-3'>");
      $("[name=icon]").attr("href", icon);
    }

    if (app.urlParams.has("fields")) {
      app.fields = app.urlParams.get("fields").split(",");
      $.each(app.fields, function(index, field) {
        field = decodeURI(field);
        app.userFields.push(field);
      });
    }

    if (app.urlParams.has("hidden")) {
      app.hidden = app.urlParams.get("hidden").split(",");
    }
  },

  buildMap: function() {
    var mapTypeIds = [];
    for(var type in google.maps.MapTypeId) {
      mapTypeIds.push(google.maps.MapTypeId[type]);
    }
    mapTypeIds.push("OSM");

    app.map = new google.maps.Map(document.getElementById("map"), {
      styles: [{
        featureType: "poi",
        stylers: [{visibility: "off"}]
      }, {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{visibility: "off"}]
      }],
      fullscreenControl: false,
      zoomControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: mapTypeIds
      },
      controlSize: 28,
      mapTypeId: app.urlParams.has("map") ? app.urlParams.get("map") : "roadmap",
    });

    app.map.mapTypes.set("OSM", new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        return "https://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
      },
      tileSize: new google.maps.Size(256, 256),
      name: "OSM",
      maxZoom: 18
    }));

    var OSMattribution = document.createElement("div");
    OSMattribution.id = "OSMattribution";
    OSMattribution.innerHTML = "<div class='text-center' style='margin-bottom: 15px; margin-right: -40px; color: white; text-shadow: black 0.1em 0.1em 0.2em'>© <a href='https://www.openstreetmap.org/copyright' target='_blank' style='color: white; text-decoration: none;'>OpenStreetMap contributors</a></div>";
    OSMattribution.style.display = "none";
    app.map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(OSMattribution);

    app.markerCluster = new MarkerClusterer(app.map, null, {
      imagePath: "assets/vendor/js-marker-clusterer/images/m",
      maxZoom: 16
    });

    app.selectedFeature = new google.maps.Data({
      map: app.map,
      style: {
        clickable: false,
        zIndex: 2,
        fillColor: "#00ffff",
        fillOpacity: 0,
        strokeColor: "#00ffff",
        strokeWeight: (app.urlParams.has("style") && JSON.parse(app.urlParams.get("style")).strokeWeight) ? JSON.parse(app.urlParams.get("style")).strokeWeight : 2,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: (app.urlParams.has("style") && JSON.parse(app.urlParams.get("style")).icon && JSON.parse(app.urlParams.get("style")).icon.scale) ? JSON.parse(app.urlParams.get("style")).icon.scale : 5,
          strokeColor: "white",
          strokeWeight: (app.urlParams.has("style") && JSON.parse(app.urlParams.get("style")).icon && JSON.parse(app.urlParams.get("style")).icon.strokeWeight) ? JSON.parse(app.urlParams.get("style")).icon.strokeWeight : 1,
          fillColor: "#00ffff",
          fillOpacity: 0.9
        }
      }
    });

    app.map.addListener("click", function(event) {
      $("input").blur();
      app.selectedFeature.forEach(function(feature) {
        app.selectedFeature.remove(feature);
      });
    });

    app.map.addListener("dragstart", function(event) {
      $("input").blur();
    });

    app.map.addListener("maptypeid_changed", function(event) {
      if (app.map.getMapTypeId() == "OSM") {
        $("#OSMattribution").show();
      } else {
        $("#OSMattribution").hide();
      }
    });

    app.autocomplete.addListener("place_changed", function() {
      var place = this.getPlace();
      if (place) {
        app.placeChanged(place);
      }
    });

    app.autocomplete.bindTo("bounds", app.map);

    app.map.data.setStyle(function(feature) {
      var style = {
        zIndex: 1,
        fillColor: "red",
        fillOpacity: 0.2,
        strokeColor: "red",
        strokeOpacity: 1,
        strokeWeight: 2
      };

      if (app.urlParams.has("style")) {
        style = JSON.parse(app.urlParams.get("style"));

        if (style.property && style.values) {
          var value = feature.getProperty(style.property);
          style = {
            zIndex: 1,
            fillColor: style.values[value] ? style.values[value] : "black",
            fillOpacity: 0.2,
            strokeColor: style.values[value] ? style.values[value] : "white",
            strokeOpacity: 1,
            strokeWeight: 2,
            icon: (style.values[value] && style.values[value].startsWith("http")) ? style.values[value] : {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 5,
              strokeColor: "white",
              strokeWeight: 1,
              fillColor: style.values[value] ? style.values[value] : "black",
              fillOpacity: 0.9
            }
          };
        }
      }
      return (style);
    });

    app.map.data.addListener("mouseover", function(event) {
      if (app.urlParams.has("hover")) {
        var fields = app.urlParams.get("hover").split(",");
        var value = fields.map(function(field) {
          return event.feature.getProperty(field);
        });
        $("#info-box").html(value.join(" | "));
        $("#info-box").show();
      } else {
        $("#info-box").hide();
      }
    });

    app.map.data.addListener("mouseout", function(event) {
      $("#info-box").html("");
      $("#info-box").hide();
    });

    app.map.data.addListener("click", function(event) {
      app.clickFeature(event.feature);
    });

    if (app.urlParams.has("attribution")) {
      var attribution = decodeURIComponent(app.urlParams.get("attribution"));
      var attributionDiv = document.createElement("div");
      if (attribution.startsWith("http")) {
        attribution = "<a href='" + attribution + "' target='_blank' style='color: rgb(68, 68, 68); text-decoration: none;'>" + attribution + "</a>";
      }
      attributionDiv.id = "attribution";
      attributionDiv.innerHTML = '<div class="gmnoprint gm-style-cc" draggable="false" style="z-index: 1000001; user-select: none; height: 14px; line-height: 14px; position: absolute; right: 0px; bottom: 0px;"><div style="opacity: 0.7; width: 100%; height: 100%; position: absolute;"><div style="width: 1px;"></div><div style="background-color: rgb(245, 245, 245); width: auto; height: 100%; margin-left: 1px;"></div></div><div style="position: relative; padding-right: 6px; padding-left: 6px; font-family: Roboto, Arial, sans-serif; font-size: 10px; color: rgb(68, 68, 68); white-space: nowrap; direction: ltr; text-align: right; vertical-align: middle; display: inline-block;">' + attribution +'</div></div>';
      attributionDiv.index = 1;
      app.map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(attributionDiv);
    }

  },

  initLocationCtrl: function() {
    var watchId;

    var locationMarker = new google.maps.Marker({
      map: app.map,
      clickable: false,
      visible: false,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#3a84df",
        fillOpacity: 0.9,
        strokeColor: "#fff",
        strokeWeight: 2
      }
    });

    var locationCircle = new google.maps.Circle({
      map: app.map,
      clickable: false,
      visible: false,
      radius: 1,
      strokeColor: "#3a84df",
      strokeOpacity: 0.8,
      strokeWeight: 0.5,
      fillColor: "#3a84df",
      fillOpacity: 0.10
    });

    var geolocationBtn = document.createElement("div");
    geolocationBtn.id = "geolocationBtn";
    geolocationBtn.style.cssText = "background-color:#fff;border:2px solid #fff;border-radius 3px;box-shadow:rgba(0,0,0,0.3) 0px 1px 4px -1px;margin-right:7px;cursor:pointer;border-radius:2px;padding:3px;";
    geolocationBtn.index = 1;

    var geolocationIcon = document.createElement("div");
    geolocationIcon.id = "geolocationIcon";
    geolocationIcon.style.cssText = "background-size:36px 18px;width:18px;height:18px;opacity:0.9;background-image:url(assets/img/geolocation.png);";

    geolocationBtn.appendChild(geolocationIcon);

    google.maps.event.addDomListener(geolocationBtn, "click", function() {
      if (navigator.geolocation) {
        if (locationMarker.getVisible()) {
          locationMarker.setVisible(false);
          locationCircle.setVisible(false);
          navigator.geolocation.clearWatch(watchId);
          geolocationIcon.style.backgroundPosition = "";
        } else {
          locationMarker.setVisible(true);
          locationCircle.setVisible(true);
          geolocationIcon.style.backgroundPosition = "-18px";
          navigator.geolocation.getCurrentPosition(function(position){
            locationUpdate(position);
            app.map.fitBounds(locationCircle.getBounds());
            watchId = navigator.geolocation.watchPosition(locationUpdate, geolocationError, {enableHighAccuracy: true});
          }, geolocationError, {enableHighAccuracy: true});
        }
      } else {
        alert("Error: Your browser doesn't support geolocation.");
      }
    });

    function geolocationError(error) {
      alert("Error: " + error.message);
      locationMarker.setVisible(false);
      locationCircle.setVisible(false);
    }

    function locationUpdate(position){
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      locationMarker.setPosition(latLng);
      locationCircle.setCenter(latLng);
      locationCircle.setRadius(position.coords.accuracy);
    }

    app.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(geolocationBtn);
  },

  clickFeature: function(feature) {
    var content = "<table class='table table-striped table-bordered table-sm'>";
    if (app.userFields.length > 0) {
      $.each(app.userFields, function(index, prop) {
        val = app.formatProperty(feature.getProperty(prop));
        if (val) {
          content += "<tr><th>" + prop.toUpperCase().replace(/_/g, " ") + "</th><td>" + val + "</td></tr>";
        }
      });
    } else {
      feature.forEachProperty(function(val, prop) {
        if (prop !== "_id_") {
          val = app.formatProperty(val);
          if (val) {
            content += "<tr><th>" + prop.toUpperCase().replace(/_/g, " ") + "</th><td>" + val + "</td></tr>";
          }
        }
      });
    }
    content += "<table>";
    $("#feature-info").html(content);
    $("#feature-modal").modal("show");

    app.selectFeature(feature);
    app.urlParams.append("id", feature.getId());
    var link = location.origin + location.pathname + "?" + app.urlParams.toString();
    $("#url-input").val(link);
  },

  addMarkerToCluster: function(feature) {
    app.map.data.overrideStyle(feature, {
      visible: false
    });
    
    if (app.urlParams.has("style")) {
      var style = JSON.parse(app.urlParams.get("style"));

      if (style.property && style.values) {
        var value = feature.getProperty(style.property);
        style.icon = (style.values[value] && style.values[value].startsWith("http")) ? style.values[value] : {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          strokeColor: "white",
          strokeWeight: 1,
          fillColor: style.values[value] ? style.values[value] : "black",
          fillOpacity: 0.9
        };
      }
    }
    
    var marker = new google.maps.Marker({
      position: feature.getGeometry().get(),
      icon: (style && style.icon) ? style.icon : ""
    });

    app.markerCluster.addMarker(marker);
    
    google.maps.event.addListener(marker, "click", function(event) {
      app.clickFeature(feature);
    });
    
    google.maps.event.addListener(marker, "mouseover", function(event) {
      if (app.urlParams.has("hover")) {
        var fields = app.urlParams.get("hover").split(",");
        var value = fields.map(function(field) {
          return feature.getProperty(field);
        });
        $("#info-box").html(value.join(" | "));
        $("#info-box").show();
      } else {
        $("#info-box").hide();
      }
    });

    google.maps.event.addListener(marker, "mouseout", function(event) {
      $("#info-box").html("");
      $("#info-box").hide();
    });
  },

  selectFeature: function(feature){
    feature.toGeoJson(function(geojson){
      app.selectedFeature.forEach(function(feature) {
        app.selectedFeature.remove(feature);
      });
      app.selectedFeature.addGeoJson(geojson);
    });
  },

  placeChanged: function(place) {
    if (place && place.geometry) {
      app.map.setCenter(place.geometry.location);
      app.map.setZoom(18);
      if (place.geometry.viewport) {
        app.map.fitBounds(place.geometry.viewport);
      }
      app.infoWindow.setPosition(place.geometry.location);
      app.infoWindow.setContent("<div class='text-center'><strong>" + place.formatted_address + "</strong><div class='place-coordinates'>" + place.geometry.location.lat().toFixed(6) + ", " + place.geometry.location.lng().toFixed(6) + "</div></div>");
      app.infoWindow.open(app.map);
    } else if (place.name) {
      app.geocodeAddress(place.name);
    }
    $(".navbar-collapse").collapse("hide");
  },

  geocodeAddress: function(address) {
    app.geocoder.geocode({
      "address": address
    }, function(results, status) {
      if (status === "OK") {
        app.map.setCenter(results[0].geometry.location);
        app.map.setZoom(18);
        if (results[0].geometry.bounds) {
          app.map.fitBounds(results[0].geometry.bounds);
        }
        app.infoWindow.setPosition(results[0].geometry.location);
        app.infoWindow.setContent(results[0].formatted_address);
        app.infoWindow.open(app.map);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
    $(".navbar-collapse").collapse("hide");
  },

  fetchData: function(src) {
    var columns = [];
    var data = [];

    $.ajax({
      type: "GET",
      url: src,
      success: function(geojson, status, xhr) {
        if (app.urlParams.get("src").endsWith(".geojson") || app.urlParams.get("f") == "geojson") {
          if (typeof geojson == "string") {
            try {
              JSON.parse(geojson);
              geojson = JSON.parse(geojson);
            } catch(e) {}
          }
        }
        else if (app.urlParams.get("src").endsWith(".csv") || app.urlParams.get("f") == "csv") {
          csv2geojson.csv2geojson(geojson, {
            delimiter: "auto"
          }, function(err, data) {
            geojson = data;
          });
        }
        else if (app.urlParams.get("src").endsWith(".kml") || app.urlParams.get("f") == "kml") {
          geojson = toGeoJSON.kml(geojson);
        }
        else if (app.urlParams.get("src").endsWith(".gpx") || app.urlParams.get("f") == "gpx") {
          geojson = toGeoJSON.gpx((new DOMParser()).parseFromString(geojson, "text/xml"));
        }

        $.each(geojson.features, function(index, feature) {
          feature.id = index+1;
          feature.properties._id_ = index+1;
          data.push(feature.properties);

          $.each(feature.properties, function(index, prop) {
            if (app.userFields.length > 0) {
              $.each(app.userFields, function(index, prop) {
                if (columns.indexOf(prop) === -1) {
                  columns.push(prop);
                }
              });
            }
            else if (columns.indexOf(index) === -1) {
              columns.push(index);
            }
          });

        });

        columns = columns.map(function(column) {
          return ({
            field: column,
            title: column.toUpperCase().replace(/_/g, " "),
            sortable: true,
            align: "left",
            valign: "middle",
            visible: (app.hidden && app.hidden.indexOf(column) !== -1 || column == "_id_") ? false : true,
            formatter: app.formatProperty
          });
        });

        if (app.urlParams.has("style")) {
          var style = JSON.parse(app.urlParams.get("style"));
          if (style.property && style.values) {
            $("#legend-item").attr("hidden", null);
            $("#legend-title").html(style.property.toUpperCase().replace(/_/g, " "));
            $.each(style.values, function(property, value) {
              if (value.startsWith("http")) {
                $("#legend").append("<p><img src='" + value + "'></i> " + property + "</p>");
              } else {
                $("#legend").append("<p><i style='background:" + value + "'></i> " + property + "</p>");
              }
            });
            $.each(columns, function(index, value) {
              if (value.field == style.property) {
                columns[index].cellStyle = function cellStyle(value, row, index, field) {
                  if (style.values[row[style.property]] && style.values[row[style.property]].startsWith("http")) {
                    return {
                      css: {
                        "background-image": "url(" + style.values[row[style.property]] + ")",
                        "background-repeat": "no-repeat",
                        "background-size": "16px",
                        "padding-left": "22px",
                        "background-position": "left center",
                        "background-position-x": "3px"
                      }
                    };
                  } else {
                    return {
                      css: {
                        "box-shadow": "inset 10px 0em " + (style.values[row[style.property]] ? style.values[row[style.property]] : "black"),
                        "padding-left": "18px"
                      }
                    };
                  }
                };
              }
            });
          }
        }

        app.map.data.addGeoJson(geojson);

      }
    }).done(function() {
      // set global bounds
      app.map.data.forEach(function (feature) {
        if (feature.getGeometry()) {
          feature.getGeometry().forEachLatLng(function(latLng){
            app.bounds.extend(latLng);
            if (feature.getGeometry().getType() == "Point" && app.urlParams.has("cluster") && (app.urlParams.get("cluster") == "true" || app.urlParams.get("cluster") == "1")) {
              app.addMarkerToCluster(feature);
            }
          });
        }
      });

      // if feature id paramater present, zoom to feature
      if (app.urlParams.has("id") && app.urlParams.get("id").length > 0) {
        var feature = app.map.data.getFeatureById(app.urlParams.get("id"));
        var featureBounds = new google.maps.LatLngBounds();
        feature.getGeometry().forEachLatLng(function(latLng){
          featureBounds.extend(latLng);
        });

        // setCenter for points, fitBounds for others
        if (feature.getGeometry().getType() == "Point") {
          app.map.setCenter(feature.getGeometry().get());
          app.map.setZoom(18);
        } else {
          app.map.fitBounds(featureBounds);
        }

        // trigger click to pop up modal and highlight feature
        google.maps.event.trigger(app.map.data, "click", {
          feature: app.map.data.getFeatureById(app.urlParams.get("id"))
        });

      // if no id parameter passed, zoom to all features
      } else {
        app.map.fitBounds(app.bounds);
      }

      app.buildTable(columns, data);
    });
  },

  buildTable: function(columns, data) {
    $("#table").bootstrapTable({
      cache: false,
      classes: "table table-bordered table-hover table-sm",
      toolbar: "#toolbar",
      toolbarAlign: "right",
      buttonsClass: "light",
      height: $("#table-container").height(),
      undefinedText: "",
      striped: false,
      pagination: false,
      minimumCountColumns: 1,
      sortName: app.urlParams.has("sort") ? app.urlParams.get("sort") : "_id_",
      sortOrder: app.urlParams.has("order") ? app.urlParams.get("order") : "asc",
      search: true,
      trimOnSearch: false,
      searchAlign: "left",
      showColumns: true,
      showToggle: false,
      buttonsAlign: "left",
      columns: columns,
      data: data,
      onClickRow: function(row, $element) {
        var feature = app.map.data.getFeatureById(row._id_);
        app.zoomToFeature(feature);
        if (feature.getGeometry().getType() == "Point" && app.map.getStreetView().getVisible()) {
          app.map.getStreetView().setPosition(feature.getGeometry().get());
        }
      },
      onDblClickRow: function(row) {
        var feature = app.map.data.getFeatureById(row._id_);
        app.clickFeature(feature);
      },
      onSearch: function(text) {
        var data = $("#table").bootstrapTable("getData");
        var visibleIDs = data.map(function(feature) {
          return (feature._id_);
        });
        app.bounds = new google.maps.LatLngBounds();
        app.markerCluster.clearMarkers();
        app.map.data.forEach(function(feature) {
          if ($.inArray(feature.getId(), visibleIDs) == -1) {
            app.map.data.overrideStyle(feature, {
              visible: false
            });
          } else {
            app.map.data.overrideStyle(feature, {
              visible: true
            });
            if (feature.getGeometry()) {
              feature.getGeometry().forEachLatLng(function(latLng){
                app.bounds.extend(latLng);
                if (feature.getGeometry().getType() == "Point" && app.urlParams.has("cluster") && (app.urlParams.get("cluster") == "true" || app.urlParams.get("cluster") == "1")) {
                  app.addMarkerToCluster(feature);
                }
              });
            }
          }
        });
        $("#feature-count").html(data.length);
      }
    });

    $(".search input").attr("placeholder", "Filter Records");
    $("#feature-count").html(data.length);
    $("#total-count").html(data.length);
  },

  zoomToFeature: function(feature) {
    var bounds = new google.maps.LatLngBounds();
    feature.getGeometry().forEachLatLng(function(latLng){
      bounds.extend(latLng);
    });
    app.selectFeature(feature);
    app.map.fitBounds(bounds);
    if (feature.getGeometry().getType() == "Point") {
      app.map.setZoom(18);
    }
  },

  formatProperty: function(value) {
    if (!value) {
      value = "";
    }
    else if (typeof value == "string" && (value.startsWith("http"))) {
      value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
    }
    return value;
  },

  switchView: function(view) {
    if (view == "split") {
      $("#table-container").show().css("height", "60%");
      $("#map-container").show().css("height", "40%");
      $(window).resize();
    } else if (view == "map") {
      $("#map-container").show().css("height", "100%");
      $("#table-container").hide();
      $(window).resize();
    } else if (view == "table") {
      $("#table-container").show().css("height", "100%");
      $("#map-container").hide();
      $(window).resize();
    }
    $("#view-dropdown").dropdown("toggle");
    $(".navbar-collapse").removeClass("show");
    app.resize();
  }
};

$(document).ready(function() {
  app.init();
  $("#search").keydown(function(event){
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});
