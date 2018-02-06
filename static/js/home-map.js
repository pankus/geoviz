
  var ancient = new L.tileLayer('http://www.isma.cnr.it/maps/tiles-pirate/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 6,
        minZoom: 0,
      }),
      topomap = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri, DeLorme, FAO, USGS, NOAA | Esri, DeLorme, FAO, USGS, NOAA',
        maxZoom: 13,
        minZoom: 7
      }),
      watercolor = new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
          'Map data {attribution.OpenStreetMap}',
        maxZoom: 10,
        minZoom: 3
      }),
      imagery = new L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles by Ajashton &amp; &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      OceanBasemap = new L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',{
        attribution: '&mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 10
      }),
      // AWMC = new L.tileLayer ('isawnyu.map-knmctlkh', {
      AWMC = new L.tileLayer ('http://api.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png', {
        attribution:  "Tiles &copy; <a href='http://mapbox.com/' target='_blank'>MapBox</a> | " +
                      "Data &copy; <a href='http://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> and contributors, CC-BY-SA |"+
                      " Tiles and Data &copy; 2013 <a href='http://www.awmc.unc.edu' target='_blank'>AWMC</a>" +
                      " <a href='http://creativecommons.org/licenses/by-nc/3.0/deed.en_US' target='_blank'>CC-BY-NC 3.0</a>",
        maxZoom: 18,
        minZoom: 0,
      });

  var map = L.map('map', {
    center: [36.87962, 17.13867],
    zoom: 5,
    //layers: [ancient, topomap],
    layers: [AWMC],
    fullscreenControl: true                 // add fullscreen control to the map
  });

  var baseMaps = {
    "ISMA" : ancient,
    "TopoMap" : topomap,
    "Satellite" : imagery,
    "Mediterraneo" : OceanBasemap,
    "Watercolor" : watercolor,
    "ISAW" : AWMC
  };
  
    L.control.layers(baseMaps).addTo(map);

  var markers = new L.MarkerClusterGroup({
      maxClusterRadius: 40
    });
 
 
  markers.addLayers(projects.map(function(array) {
    return new L.Marker(new L.LatLng(array[0], array[1]), {
      title: array[2],
      icon: L.icon({
        iconSize: [32, 37],
        iconAnchor: [16, 37],
        popupAnchor:  [0, -30],
        iconUrl: 'maps/icons/ico' + array[3] + '.png'
      })
    }).bindPopup('<h7>' + array[2] + '</h7><br>'
                 + '<img style="margin: 5px 10px 0 0" src="' + array[6] + '" align="left" margin="10px">'
                 + array[5] + '<br>'
                 + '<a href="' + array[4] + '" style="text-align:right !important;">' + '[read more] →' + '</a>');
  }));
  map.addLayer(markers);

  // scala
  //L.control.scale().addTo(map);
  

  // detect fullscreen toggling
		map.on('enterFullscreen', function(){
			if(window.console) window.console.log('enterFullscreen');
		});
		map.on('exitFullscreen', function(){
			if(window.console) window.console.log('exitFullscreen');
		});

// DEBUG
 // map.on('click', function(e) {
 //     alert(e.latlng);
 // });