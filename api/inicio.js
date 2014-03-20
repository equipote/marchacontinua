// Módulos
////////////////
var http = require('http')
  , fs = require('fs')
  , qs = require('querystring');

// Configuración
////////////////
var config = require(__dirname+'/../config.json');

// Datos
////////////////
var puntos = require(__dirname+config.datos);

// Funciones auxiliares
////////////////

// Devuelve array con los datos sin teléfono
function limpiaTf() {
  var resultado = [];
  for (var tf in puntos) {
    resultado.push(puntos[tf]);
  }
  return resultado;
}

function validarTf(datos) {
  return (datos.hasOwnProperty('tf') && !isNaN(parseInt(datos.tf)));
}

function validarLat(datos) {
  return (datos.hasOwnProperty('lat') && !isNaN(parseFloat(datos.lat)));
}

function validarLon(datos) {
  return (datos.hasOwnProperty('lon') && !isNaN(parseFloat(datos.lon)));
}

function validarSalvar(url, datos) {
  return (url.indexOf('/salvar')>-1 && datos.hasOwnProperty('apikey') && (datos.apikey == config.APIKEY)); 
}

function autentificar(datos) {
  return (puntos.hasOwnProperty(datos.tf) || (datos.hasOwnProperty('apikey') && (datos.apikey == config.APIKEY))); 
}

function humanizaFecha(f) {
  return f.getDate()+'/'+f.getMonth()+'/'+f.getFullYear()+' '+f.getHours()+':'+f.getMinutes()+':'+f.getSeconds();
}

function enviarJSON (res, cuerpo) {
  res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
  res.end(JSON.stringify(cuerpo));
}

// WEBSERVER
///////////////

webserver = http.createServer(function(req, res){
  var cuerpo = {error:true,datos:'ERROR'};
  if (req.method == 'POST') {
  // Se mueve un punto desde la app móvil
    var body = '';
    req.on('data', function(data) { body += data; });
    req.on('end', function() {
      var datos = qs.parse(body)
        , ahora = new Date();

      cuerpo.error = !validarSalvar(req.url, datos);
      if (cuerpo.error) {
        cuerpo.error = !validarTf(datos);
        if (cuerpo.error) {
          cuerpo.datos = 'Teléfono inválido';
        } else {
          cuerpo.error = !validarLat(datos);
          if (cuerpo.error) {
            cuerpo.datos = 'Latitud inválida';
          } else {
            cuerpo.error = !validarLon(datos);
            if (cuerpo.error) {
              cuerpo.datos = 'Longitud inválida';
            } else {
              cuerpo.error = !autentificar(datos);
              if (cuerpo.error) {
                cuerpo.datos = 'No tienes permisos para realizar esta acción';
              } else {
                if (datos.hasOwnProperty('ciudad')) {
                  var ciudad = datos.ciudad;
                } else {
                  var ciudad = puntos[datos.tf].ciudad;
                }
                puntos[datos.tf]={'ciudad':ciudad,lat:parseFloat(datos.lat),lon:parseFloat(datos.lon),time:ahora.valueOf()};
                cuerpo.datos = puntos[datos.tf];
                console.log(cuerpo.datos);
              }
            }
          }
        }
        enviarJSON(res,cuerpo);
      } else {
        // Permanencia: Guardamos array puntos en disco
        var fichero = __dirname+config.datos;
        fs.writeFile(fichero+'.'+ahora.valueOf(), JSON.stringify(puntos), function(err) {
          if (err) {
            cuerpo.error = true;
            cuerpo.datos = 'Error al guardar '+fichero+'.'+ahora.valueOf();
            enviarJSON(res,cuerpo);
          } else {
            fs.writeFile(fichero, JSON.stringify(puntos), function(err) {
              if (err) {
                cuerpo.error = true;
                cuerpo.datos = 'Error al guardar '+fichero;
              } else {
                cuerpo.datos = 'Guardado el '+humanizaFecha(ahora);
              }
              enviarJSON(res,cuerpo);
            });
          }
	});
      }

      //enviarJSON(res,cuerpo);
      //res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
      //res.end(JSON.stringify(cuerpo));

    });

  } else if (req.method == 'GET') {
    cuerpo.error = false;
    cuerpo.datos = limpiaTf();
    enviarJSON(res,cuerpo);
    //res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
    //res.end(JSON.stringify(cuerpo));
  }
});

webserver.listen(config.puerto, config.host);

