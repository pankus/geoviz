$('document').ready(function(){
	setTimeout(function(){ mapDisable(); },250);
	// Altezza mappa
	$('#map').css('height',$(window).height()-126);
	// Posizionamento mappa
	map.setView([42.065, 12.436], 6);
});

// Token API MapBox
L.mapbox.accessToken = 'pk.eyJ1IjoiYWxlc3Npb2RsIiwiYSI6IkhQVHhpczQifQ.durHlv8wsdQR9caggZrWnw';

// Mappa
var map = L.mapbox.map('map', null, {
	minZoom: 4,
	maxZoom: 18,
	attributionControl:true
}).on('load', function() {
	// Controllo: MiniMap
	new L.Control.MiniMap(L.mapbox.tileLayer('examples.map-i875kd35'),{
		toggleDisplay:true,
		hideText:'Nascondi MiniMap',
		showText:'Mostra MiniMap',
	}).addTo(map);
});

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup().addTo(map);
// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
	draw:{
		polyline:false, marker:false, circle:false,rectangle:false,
		polygon:{
			allowIntersection: false, // Restricts shapes to simple polygons
			showArea:true,
            drawError: {
                color: '#e1e100', // Color the shape will turn when intersects
                message: '<strong>Attenzione!<strong> Il poligono si incrocia su se stesso!' // Message that will show when intersect
            },
            shapeOptions: {
                color: '#bada55'
            }
		}
	},
    edit: {
        featureGroup: drawnItems
    }
});
// Traduzione comandi
L.drawLocal.draw.toolbar.buttons.polygon   		= 'Seleziona con un poligono';
L.drawLocal.draw.handlers.polygon.tooltip.start = 'Clicca per iniziare';
L.drawLocal.draw.handlers.polygon.tooltip.cont  = 'Clicca per continuare';
L.drawLocal.draw.handlers.polygon.tooltip.end   = 'Clicca per continuare o Doppio click per terminare';
L.drawLocal.draw.toolbar.buttons.rectangle		  = 'Seleziona con un rettangolo'; 
L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Clicca e trascina';
L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Rilascia il mouse per terminare';
L.drawLocal.edit.toolbar.buttons.edit = 'Modifica l\'area di selezione';
L.drawLocal.edit.toolbar.buttons.editDisabled = 'Non ci sono selezioni da modificare';
L.drawLocal.edit.toolbar.buttons.remove = 'Rimuovi l\'area di selezione';
L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Non ci sono selezioni da rimuovere';
L.drawLocal.edit.toolbar.actions.save.title = 'Conferma le modifiche';
L.drawLocal.edit.toolbar.actions.save.text  = 'Conferma';
L.drawLocal.edit.toolbar.actions.cancel.title = 'Annulla le modifiche';
L.drawLocal.edit.toolbar.actions.cancel.text  = 'Annulla';
// Aggiunge il controllo alla mappa
// map.addControl(drawControl);
// Eventi di Leaflet DRAW
var selectedArea=null;
map.on('draw:drawstart',function(e){
	drawnItems.clearLayers();
});
map.on('draw:created', function (e) {
    var type = e.layerType, layer = e.layer;
    drawnItems.addLayer(layer);
    // WKT da mandare al server per la query
    console.log(toWKT(layer));
    selectedArea = toWKT(layer);
});
map.on('draw:edited', function (e) {
    var layers = e.layers;
    layers.eachLayer(function (layer) {
        // WKT da mandare al server per la query
    	console.log(toWKT(layer));
    	selectedArea = toWKT(layer);
    });
});

// BaseLayers
var streets   = L.mapbox.tileLayer('examples.map-i875kd35').addTo(map);
var terrain   = L.mapbox.tileLayer('examples.map-i86nkdio');
var satellite = L.mapbox.tileLayer('examples.map-qfyrx5r8');
var realvista = L.tileLayer.wms('http://213.215.135.196/reflector/open/service?', {
	layers: 'rv1',
	format: 'image/png',
	attribution: '<a href="http://realvista.it" target="_blank"><strong>RealVista</strong></a> 1.0 Open WMS &copy; <a href="http://e-geos.it" target="_blank"><strong>e-GEOS SpA</strong></a> - CC BY SA'
});
var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
  	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
});

// Preleva i dati degli spiaggiamenti via ajax
$.ajax({
  	url : 'engine/getGeoJSON.php?rows=100000&page=1&table=cetacei',
  	type: 'POST',
  	data: {
  		rows:1000000,
  		page:1,
  		table:'cetacei',
  		fromDate:0,
  		toDate:0,
  		reg:0,
  		spe:0
  	},
  	dataType : 'json',
  	success: function (data) {
		spiaggiamenti.addData(data);
  	}
});

// Crea Layer  
var spiaggiamenti = L.geoJson(null,{
	pointToLayer: function (feature, latlng) {
		var table = $('input[name="layer-select-radio"]:checked').val();
		if (table == 'cetacei') {
	    	return L.marker(latlng, {
	           	icon: L.mapbox.marker.icon({
	           		'marker-color': '#357ebd',
	               	'marker-size': 'small'
	           	})
	        });
	  	} else {
	  		return L.marker(latlng, {
	           	icon: L.mapbox.marker.icon({
	           		'marker-color': '#6ecc39',
	               	'marker-size': 'small'
	           	})
	        });
	  	} 
	},
	onEachFeature:function (feature, layer) {
		clusterSpiaggiamenti.addLayer(layer);
		layer.bindPopup(
           	'<h5><strong>'+feature.properties.codice+'</strong></h5>'+
           	'<table class="table table-striped table-condensed">'+
           	'<tr><td>Specie</td><td>'+feature.properties.specie+'</td></tr>'+
           	'<tr><td>Data rilievo</td><td>'+feature.properties.data_rilievo+'</td></tr>'+
           	'<tr><td>Rilevatore</td><td>'+feature.properties.rilevatore+'</td></tr>'+
           	'</table>'+
           	'<button onClick="getDetails(\'' +feature.properties.codice+ '\')" class="btn btn-xs btn-default"><i class="fa fa-info"></i>&nbsp;Dettagli</button>'
       ); 
	}
});

// Crea Cluster
var clusterSpiaggiamenti = new L.MarkerClusterGroup({ 
	maxClusterRadius: 50,
	iconCreateFunction: function(cluster) {
		var table = $('input[name="layer-select-radio"]:checked').val();
		if (table == 'cetacei') {
			return new L.DivIcon({
				html:'<div><span>'+cluster.getChildCount()+'</span></div>',
				className:'blu-cluster',
				iconSize: L.point(40, 40)
			});
		} else {
			return new L.DivIcon({
				html:'<div><span>'+cluster.getChildCount()+'</span></div>',
				className:'green-cluster',
				iconSize: L.point(40, 40)
			});
		}
	}
});

// Aggiunge il layer clusterizzato alla mappa
map.addLayer(clusterSpiaggiamenti);

// Controllo: ViewCenter
map.addControl(new L.Control.ViewCenter({
	position: 'topleft',
	title: 'Torna all\'estensione iniziale',
	forceSeparateButton: true,
	vcLatLng: [42.065, 12.436],
	vcZoom: 6
}));

// Controllo: MousePosition
L.control.mousePosition({
	prefix:"Coordinate WGS84 | <a href='http://spatialreference.org/ref/epsg/4326/' target='_blank'>EPSG 4326</a>: ",
	lngFirst: true, 
	separator:", ", 
	emptyString:"Coordinate WGS84 | <a href='http://spatialreference.org/ref/epsg/4326/'>EPSG4326</a>: 00.00000, 00.00000"
}).addTo(map);

// Controllo: Toggle BaseLayers
var layers = {
	'Mappa stradale': streets,
	'Rilievo con strade': terrain,
    'Mosaico satellite/ortofoto con strade': satellite,
    'Mosaico ortofoto RealVista': realvista,
    'Mappa pastello': watercolor
};
L.control.layers(layers).addTo(map);