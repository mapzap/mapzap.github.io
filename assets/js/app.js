var app = {

  urlParams: {},

  userFields: [],

  bounds: new google.maps.LatLngBounds(),

  geocoder: new google.maps.Geocoder(),

  infoWindow: new google.maps.InfoWindow(),

  init: function() {
    this.bindUIActions();
    this.loadURLparams();
    this.buildMap();
    this.initLocationCtrl();

    $(window).resize(function () {
      $("#table").bootstrapTable("resetView", {
        height: $("#table-container").height()
      });
      google.maps.event.trigger(map, "resize");
    });
  },

  bindUIActions: function() {
    $("#geocode-btn").click(function() {
      var address = $("#address-input").val();
      app.geocodeAddress(address);
      return false;
    });

    $("#geocode-form").submit(function() {
      $("#geocode-btn").click();
      return false;
    });

    $("#extent-btn").click(function() {
      app.map.fitBounds(app.bounds);
      $(".navbar-collapse.in").collapse("hide");
      return false;
    });

    $("[name='view']").click(function() {
      $(".in,.open").removeClass("in open");
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
    if (location.search) {
      var parts = location.search.substring(1).split("&");
      for (var i = 0; i < parts.length; i++) {
        var nv = parts[i].split("=");
        if (!nv[0]) continue;
        app.urlParams[nv[0]] = nv[1] || true;
      }
    }

    if (app.urlParams.title && app.urlParams.title.length > 0) {
      var title = decodeURI(app.urlParams.title);
      $("[name='title']").html(title);
    }

    if (app.urlParams.src) {
      app.fetchData(decodeURIComponent(app.urlParams.src));
      $("#download-btn").attr("href", app.urlParams.src);
    } else {
      alert("URL `src` parameter missing!");
      $("#loading-mask").hide();
    }

    if (app.urlParams.logo && app.urlParams.logo.length > 0) {
      $("#navbar-title").prepend("<img src='" + decodeURIComponent(app.urlParams.logo) + "'>");
      $("[name=icon]").attr("href", decodeURIComponent(app.urlParams.logo));
    }

    if (app.urlParams.fields) {
      app.fields = decodeURIComponent(app.urlParams.fields).split(",");
      $.each(app.fields, function(index, field) {
        field = decodeURI(field);
        app.userFields.push(field);
      });
    }
  },

  buildMap: function() {
    app.map = new google.maps.Map(document.getElementById("map"), {
      styles: [{
        featureType: "poi",
        stylers: [{visibility: "off"}]
      }, {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{visibility: "off"}]
      }],
      center: {
        lat:42.759349,
        lng: -73.828833
      },
      zoom: 14
    });

    app.selectedFeature = new google.maps.Data({
      map: app.map,
      style: {
        clickable: false,
        fillColor: "#00ffff",
        fillOpacity: 0,
        strokeColor: "#00ffff",
        strokeWeight: 3,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          strokeColor: "black",
          strokeWeight: 1,
          fillColor: "#00ffff",
          fillOpacity: 1
        }
      }
    });

    app.map.addListener("click", function(event) {
      app.selectedFeature.forEach(function(feature) {
        app.selectedFeature.remove(feature);
      });
    });

    app.map.data.setStyle(function(feature) {
      var style = {
        fillColor: "red",
        fillOpacity: 0.2,
        strokeColor: "red",
        strokeOpacity: 1,
        strokeWeight: 2,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          strokeColor: "black",
          strokeWeight: 1,
          fillColor: "red",
          fillOpacity: 1
        }
      };

      if (app.urlParams.style) {
        /*{
          "fillColor": "red",
          "fillOpacity": 0.2,
          "strokeColor": "red",
          "strokeOpacity": 1,
          "strokeWeight": 2,
          "icon": {
            "path": 0,
            "scale": 5,
            "strokeColor": "black",
            "strokeWeight": 1,
            "fillColor": "red",
            "fillOpacity": 1
          }
        }*/
        style = JSON.parse(decodeURIComponent(app.urlParams.style));
      }
      return (style);
    });

    app.map.data.addListener("click", function(event) {
      app.clickFeature(event);
    });

  },

  initLocationCtrl: function() {
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
    geolocationBtn.style = "background-color:#fff;border:2px solid #fff;border-radius 3px;box-shadow:rgba(0,0,0,0.298039) 0 1px 4px -1px;margin-right:10px;cursor:pointer;border-radius:2px;padding:3px;";
    geolocationBtn.index = 1;
    var geolocationIcon = document.createElement("div");
    geolocationIcon.id = "geolocationIcon";
    geolocationIcon.style = "background-size:36px 18px;width:18px;height:18px;opacity:0.9;background-image:url(assets/img/geolocation.png);";
    geolocationBtn.appendChild(geolocationIcon);

    var watchId;
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
          watchId = navigator.geolocation.watchPosition(locationUpdate, function() {
            alert("Error: The Geolocation service failed.");
            locationMarker.setVisible(false);
            locationCircle.setVisible(false);
          }, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000
          });
        }
      } else {
        alert("Error: Your browser doesn't support geolocation.");
      }
    });

    function locationUpdate(position){
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      locationMarker.setPosition(latLng);
      locationCircle.setCenter(latLng);
      locationCircle.setRadius(position.coords.accuracy);
      app.map.fitBounds(locationCircle.getBounds());
    }

    app.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(geolocationBtn);
  },

  clickFeature: function(event) {
    var content = "<table class='table table-striped table-bordered table-condensed'>";
    if (app.userFields.length > 0) {
      $.each(app.userFields, function(index, prop) {
        val = app.formatProperty(event.feature.getProperty(prop));
        if (val) {
          content += "<tr><th>" + prop + "</th><td>" + val + "</td></tr>";
        }
      });
    } else {
      event.feature.forEachProperty(function(val, prop) {
        if (prop !== "_id_") {
          val = app.formatProperty(val);
          content += "<tr><th>" + prop + "</th><td>" + val + "</td></tr>";
        }
      });
    }
    content += "<table>";
    $("#feature-info").html(content);
    $("#featureModal").modal("show");

    app.selectFeature(event.feature);

    $("#share-btn").click(function() {
      app.buildShareLink(event.feature);
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

  geocodeAddress: function(address) {
    geocoder.geocode({"address": address}, function(results, status) {
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
    $(".in,.open").removeClass("in open");
  },

  fetchData: function(src) {
    var columns = [];
    var data = [];

    $.getJSON(src, function (geojson) {
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
          title: column,
          sortable: true,
          visible: (column == "_id_") ? false : true,
          formatter: app.formatProperty
        });
      });

      app.map.data.addGeoJson(geojson);

    }).done(function() {
      // set global bounds
      app.map.data.forEach(function (feature) {
        feature.getGeometry().forEachLatLng(function(latLng){
          app.bounds.extend(latLng);
        });
      });

      // if feature id paramater present, zoom to feature
      if (app.urlParams.id && app.urlParams.id.length > 0) {
        var feature = app.map.data.getFeatureById(app.urlParams.id);
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
          feature: app.map.data.getFeatureById(app.urlParams.id)
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
      height: $("#table-container").height(),
      undefinedText: "",
      striped: false,
      pagination: false,
      minimumCountColumns: 1,
      sortName: app.urlParams.sortfield ? app.urlParams.sortfield : "_id_",
      sortOrder: app.urlParams.sortorder ? app.urlParams.sortorder : "asc",
      search: true,
      trimOnSearch: false,
      searchAlign: "left",
      showColumns: true,
      showToggle: true,
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
        if (feature.getGeometry().getType() == "Point") {
          app.map.getStreetView().setPosition(feature.getGeometry().get());
          app.map.getStreetView().setVisible(true);
        }
      }
    });

    $("#loading-mask").hide();
  },

  buildShareLink: function(feature) {
    app.urlParams.id = feature.getId();
    var params = {};
    $.each(app.urlParams, function(key, value) {
      params[key] = decodeURIComponent(value);
    });
    var link = location.origin + location.pathname + "?" + $.param(params).replace(/\+/g, "%20");
    $("#share-hyperlink").attr("href", link);
    $("#share-twitter").attr("href", "https://twitter.com/intent/tweet?url=" + encodeURIComponent(link));
    $("#share-facebook").attr("href", "https://facebook.com/sharer.php?u=" + encodeURIComponent(link));
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
      $("#view").html("Split View");
      $("#table-container").show().css("height", "55%");
      $("#map-container").show().css("height", "45%");
      $(window).resize();
    } else if (view == "map") {
      $("#view").html("Map View");
      $("#map-container").show().css("height", "100%");
      $("#table-container").hide();
      $(window).resize();
    } else if (view == "table") {
      $("#view").html("Table View");
      $("#table-container").show().css("height", "100%");
      $("#map-container").hide();
      $(window).resize();
    }
  }
};

$(document).ready(function() {
  app.init();
});
