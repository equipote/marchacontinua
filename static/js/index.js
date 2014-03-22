function dibumapa() {
	map = L.map('map', {
    		center: [40.41686, -3.70345],
    		zoom: 13,
    		scrollWheelZoom: false
	});

	//var map = L.map('map', {scrollWheelZoom:false});

	L.tileLayer('http://{s}.tile.cloudmade.com/4f5c5233516d4c39a218425764d98def/56578/256/{z}/{x}/{y}.png', {
		attribution: '<a href="http://openstreetmap.org">O</a><a href="http://cloudmade.com">C</a>',
    		maxZoom: 18
	}).addTo(map);
}


$('#ciudades').on('change', function() {
	var latlon = $(this).val().split(',');
	if (latlon.length == 2) {
		map.setView (new L.LatLng(parseFloat(latlon[0]), parseFloat(latlon[1])), 16);
	}
});

var marcadores = [];

function dibujarMarchas() {
	$.getJSON("http://marchacontinua.tk/api", function(datos) {
		if (datos.error) {
			alert(datos.datos);
		} else {
			datos=datos.datos;
			for (i=0; i<datos.length; i++) {
				if (marcadores.length < datos.length) {
					marcadores[i]=L.marker([datos[i].lat, datos[i].lon]).addTo(map);
					$('#ciudades').append('<option value="'+datos[i].lat+','+datos[i].lon+'">'+datos[i].ciudad+'</option>'+"\n");
				} else {
					marcadores[i].setLatLng([datos[i].lat, datos[i].lon]);
				}
			}
			setTimeout(dibujarMarchas, 3000);
		}
	});
}

//setInterval(dibujarMarchas, 30000);
dibujarMarchas();

//jquery
//cuando pulsa chat

var cargado = false;

$('#chati').on('click', function(e) {
	e.preventDefault();
	var irc=$('#linkirc').attr('rel');
	if (!cargado) {
		$('#cc').show();
        	$('#irc').attr('src', irc);
        	$('#irc').on('load', function() {
			cargado = true;
                	$('#cc').show().delay(2000).hide(function() { $('#irc').show(); });
			$('#linkirc').text('X');
        	});
	} else {
		if ($('#linkirc').text() == 'X') {
			$('#linkirc').text('CHAT');
		} else {
			$('#linkirc').text('X');
		}
		$('#irc').toggle('slow');
	}
});

var alto,
    map;

function dartama() {
	alto = $(window).height() - $('#locontiene').offset().top;
	console.log(alto);
	$('#map').css('height', alto);
	$('#cc').css('height', alto);
	$('#irc').css('height', alto);
}

$(document).on('ready', function() {
	dartama();
	dibumapa();
});

$(window).resize(function() {
	dartama();
});

$('#lax').on('click', function() {
	$('#loswindows').fadeOut();
});
$('#que').on('click', function() {
	$('#loswindows').fadeIn();
});
