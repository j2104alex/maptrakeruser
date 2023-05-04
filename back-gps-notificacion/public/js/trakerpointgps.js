
let watchIDElement;
let nombreRutaDB = "Ruta taxi";
let nombreRutaDBRoom = "";
let opcionesRuta = []
let watchID;
let simlutePintCoordenate = 0
let puntosSimulacion;
//variable para validar si el usuario actual puede enviar datos.
let usersenddata = false

document.addEventListener('DOMContentLoaded', main, false);

/* let temporizadorSimulador = setInterval(() => {
    simlutePintCoordenate += 1
}, 3000); */

function main() {

    //NOS CONECTAMOS A LA FIREBASE PARA SIMULAR UNA RUTA
    let datosfirebase;
    //TODO:CUANDO este funcionando en movil habilitamos esta linea.
    //window.socket.emit('geo_posicion', { room: nombreRutaDBRoom, data: _datos });
    //console.log("enviando datos....")



    //HACEMOS LA PETICION A FIREBASE DE LAS RUTAS GUARDADAS CON ANTERIORIDAD.
    fetch(`https://amigaapp-f2f93-default-rtdb.firebaseio.com/dbrutas/Ruta%20taxi.json`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })

        .then(response => response.json())
        .then(json => {

            console.log(json)
            puntosSimulacion = Object.values(json)
            console.log(puntosSimulacion)

        })
        .catch(err => console.log(err))
        .finally(() => {
            console.log('finish')


        })

    // Cordova is now initialized. Have fun!

    //TEST URL LOCAL
    let socket = io("http://localhost:8000", {
        withCredentials: true
    })
    /* let socket = io("https://socket-maptracker.onrender.com",{
        withCredentials: true
    }) */



    window.socket = socket

    //EVENT PARA ESPERAR RESPUESTA SI 2 USUARIO SE CONECTARON A LA MISMA RUTA
    window.socket.on("route_message_user", (data) => {
        console.log(data)

        if (data.status) {
            document.getElementById('info').innerHTML = data.message
        }

        if (!data.status) {
            usersenddata = !data.status
        }
    })

    /* WonderPush.setLogging(true, function () {
        console.log("Success");
    }); */

    /*  WonderPush.setLogging(true) */

    //CONFIGURANDO LA NOTIFICACION PUSH.
    // Prompt user for push subscription
    /* WonderPush.subscribeToNotifications(); */


    document.getElementById("getPosition").addEventListener("click", getPosition);
    document.getElementById("watchPosition").addEventListener("click", watchPosition);
    /*  document.getElementById("networkInfo").addEventListener("click", networkInfo);
     document.addEventListener("offline", onOffline, false);
     document.addEventListener("online", onOnline, false);
     document.addEventListener("stopwatchPosition", stopWatch, false);
     document.getElementById("getAcceleration").addEventListener("click", getAcceleration);
     document.getElementById("watchAcceleration").addEventListener(
         "click", watchAcceleration); */


    fetch('https://amigaapp-f2f93-default-rtdb.firebaseio.com/dbrutas.json')
        .then(response => response.json())
        .then(json => {


            Object.keys(json).forEach(element => {
                opcionesRuta.push(element)

            });

        })
        .catch(err => console.log(err))
        .finally(() => {
            let selectRutas = document.getElementById('selectRutas');
            console.log(opcionesRuta)
            opcionesRuta.forEach(opcion => {
                console.log("opcion", opcion)
                let Op = document.createElement('option')
                Op.value = opcion
                Op.text = opcion
                selectRutas.add(Op)
            });

        })

    document.getElementById('selectRutas').addEventListener('change', (event) => {
        if (usersenddata) {
            let temporizadorSimulador = setInterval(() => {
                window.socket.emit('geo_posicion', { room: nombreRutaDBRoom, data: puntosSimulacion[simlutePintCoordenate] });

                console.log("enviando datos....", puntosSimulacion[simlutePintCoordenate])

                simlutePintCoordenate += 1
            }, 2000);
        }


    });


}



function onSelectRuta(e) {
    console.log(e.target.value);
    nombreRutaDBRoom = e.target.value.replace(" ", "_")
    window.socket.emit('check_length_users_route_gps', { conect: 'user', room: nombreRutaDBRoom });
}

function getPosition() {

    var options = {
        enableHighAccuracy: true,
        maximumAge: 3600000
    }
    watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    function onSuccess(position) {
        alert('Latitude: ' + position.coords.latitude + '\n' +
            'Longitude: ' + position.coords.longitude + '\n' +
            'Altitude: ' + position.coords.altitude + '\n' +
            'Accuracy: ' + position.coords.accuracy + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            'Heading: ' + position.coords.heading + '\n' +
            'Speed: ' + position.coords.speed + '\n' +
            'Timestamp: ' + position.timestamp + '\n');
    };

    function onError(error) {
        alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }
}

function stopWatch() {
    navigator.geolocation.clearWatch(watchID);
}



function watchPosition() {
    //document.getElementById('stopwatchPosition').classList.remove('disabled')
    if (nombreRutaDBRoom === "") {
        alert("Seleccione la ruta por favor.")
    }
    else {
        var options = {
            maximumAge: 3600000,
            timeout: 1000,
            enableHighAccuracy: true,
        }
        watchIDElement = navigator.geolocation.watchPosition(onSuccess, onError, options);

        function onSuccess(position) {

            if (usersenddata) {
                document.getElementById('info').innerHTML =
                    'Latitude: ' + position.coords.latitude + '\n' +
                    'Longitude: ' + position.coords.longitude + '\n' +
                    'Altitude: ' + position.coords.altitude + '\n' +
                    'Accuracy: ' + position.coords.accuracy + '\n' +
                    'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                    'Heading: ' + position.coords.heading + '\n' +
                    'Speed: ' + position.coords.speed + '\n' +
                    'Timestamp: ' + position.timestamp + '\n';

                let _datos = {
                    'Fecha': new Date().toLocaleString().replace(",", "-").replace(" ", ""),
                    'Latitude': position.coords.latitude,
                    'Longitude': position.coords.longitude,
                    'Heading': position.coords.heading,
                    'Speed': position.coords.speed
                }
            }
        }

        function onError(error) {
            alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        }
    }
}

function networkInfo() {
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.CELL] = 'Cell generic connection';
    states[Connection.NONE] = 'No network connection';
    alert('Connection type: ' + states[networkState]);
}

function onOffline() {
    alert('You are now offline!');
}

function onOnline() {
    alert('You are now online!');
}

function getAcceleration() {
    navigator.accelerometer.getCurrentAcceleration(
        accelerometerSuccess, accelerometerError);

    function accelerometerSuccess(acceleration) {
        alert('Acceleration X: ' + acceleration.x + '\n' +
            'Acceleration Y: ' + acceleration.y + '\n' +
            'Acceleration Z: ' + acceleration.z + '\n' +
            'Timestamp: ' + acceleration.timestamp + '\n');
    };

    function accelerometerError() {
        alert('onError!');
    };
}

function watchAcceleration() {
    var accelerometerOptions = {
        frequency: 3000
    }
    var watchID = navigator.accelerometer.watchAcceleration(
        accelerometerSuccess, accelerometerError, accelerometerOptions);

    function accelerometerSuccess(acceleration) {
        alert('Acceleration X: ' + acceleration.x + '\n' +
            'Acceleration Y: ' + acceleration.y + '\n' +
            'Acceleration Z: ' + acceleration.z + '\n' +
            'Timestamp: ' + acceleration.timestamp + '\n');

        setTimeout(function () {
            navigator.accelerometer.clearWatch(watchID);
        }, 10000);
    };

    function accelerometerError() {
        alert('onError!');
    };

}

