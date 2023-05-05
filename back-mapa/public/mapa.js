window.addEventListener('DOMContentLoaded', () => {


    //SOCKET CODE

    let userChat = []
    let rutaSeleccionada = ""

    var socket = io();

    onSelectRuta = (e) => {
        console.log("SELECCINADO:", e.target.value.replace(" ", "_"))
        //SAVE ROUTE SELECTED
        rutaSeleccionada = e.target.value.replace(" ", "_")
        console.log(rutaSeleccionada)
        socket.emit('user_conect_room_serve', { room: rutaSeleccionada })

    }

    //SEND MESSAGE CHAT
    onSendMessage = (e) => {
        e.preventDefault()
        let messageUser = document.querySelector('#message_input')
        //IF MESSAGE NOT IS EMPY, SEND DATA
        if (messageUser != "") {
            socket.emit('chat_send_message', { message: messageUser.value, route: rutaSeleccionada })
            messageUser.value=""
        }

    }

    socket.on('send_list_users', (users) => {
        console.log("Salas disponibles", users)
        userChat = users
        console.log("users in chat", userChat)
        loadUserChat()
    })

    //DETECTAMOS MENSAJE
    socket.on('message_chat', (message) => {
        //LOAD MESSAGE DIV.
        let mensajeelement = document.querySelector('#messages')
        console.log(message)
        let divuser = document.createElement("div")

        const newtext = document.createTextNode(message);
        divuser.appendChild(newtext);
        let element = document.createElement("div")
        element.classList.add("message")
        element.appendChild(divuser)
        mensajeelement.appendChild(element)
    })

    /**
     * Cargamos la lsita de todos los usuarios en el sistema.
     */
    loadUserChat = () => {

        //LOAD SALAS RUTAS DISPONIBLES.
        const mensaje = document.querySelector('.chat_users')
        //CLEAN CONTENT USERS
        mensaje.innerHTML = ""

        userChat.usersIds.forEach(user => {
            console.log(user)
            let divuser = document.createElement("div")

            const newtext = document.createTextNode("user" + user.toString().substring(0, 4));
            divuser.appendChild(newtext);
            let element = document.createElement("div")
            element.classList.add("message")
            element.appendChild(divuser)
            mensaje.appendChild(element)

        });
    }




    //Evento para los usuarios conectados.
    socket.on('chat send server message', (message) => {
        console.log("Mensaje del servidor", message)
        const mensaje = document.querySelector('#messages')

        let text = document.createElement("div")
        const newtext = document.createTextNode(message);
        text.appendChild(newtext)
        let element = document.createElement("div")
        element.classList.add("message")
        element.appendChild(text)
        mensaje.appendChild(text)
    })


    //END SOCKET CODE

    const appDiv = document.getElementById('app');
    appDiv.style.display = "none"

    //Añadimos markets
    let geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    let map;
    let from;
    let to;
    let marker;
    /*  appDiv.innerHTML = `<h1>Obtener Geolocalización</h1>`; */

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };



    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            appDiv.innerHTML += `<p>Latitud: ${pos.coords.latitude}</p>`;
            appDiv.innerHTML += `<p>Longitud: ${pos.coords.longitude}</p>`;
            loadMap(parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude))
            socket.emit('chat message', { 'lat': pos.coords.latitude, 'log': pos.coords.longitude });
        }, (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.log("User denied the request for Geolocation.")
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log("Location information is unavailable.")
                    break;
                case error.TIMEOUT:
                    console.log("The request to get user location timed out.")
                    break;
            }
        }, options);
    } else {
        console.log("Your browser doesn't support geolocation.")
    }

    // Usando watchPosition()
    let watchID = navigator.geolocation.watchPosition((pos) => {
        appDiv.innerHTML += `<h2>WatchPosition( )</h2>`;
        appDiv.innerHTML += `<p>Latitud: ${pos.coords.latitude}</p>`;
        appDiv.innerHTML += `<p>Longitud: ${pos.coords.longitude}</p>`;


    });

    navigator.geolocation.clearWatch(watchID);

    const loadMap = (lat, lng) => {


        mapboxgl.accessToken = 'pk.eyJ1IjoiY3J1c3RvMjAyMiIsImEiOiJjbDg3c3lmaTExNmg4M3BubGhyMThvMmhsIn0.AhcG868gRKbP-zDiccuMdA';
        map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [lng, lat], // starting position [lng, lat]
            //center: [-121.403732, 40.492392],
            zoom: 14, // starting zoom
            projection: 'globe' // display the map as a 3D globe
        });
        map.on('style.load', () => {
            map.setFog({}); // Set the default atmosphere style
        });


        map.on('load', async () => {


            let opcionesRuta = []


            

            //Personalizamor en point marker del usuario    
            const margkeruser = document.createElement('div');

            margkeruser.style.width = "50px"
            margkeruser.style.height = "50px"
            margkeruser.style.backgroundImage = "url('../../assets/user_profile.svg')"
            margkeruser.style.backgroundSize = "cover"
            margkeruser.style.borderRadius = "50%"
            margkeruser.style.cursor = "pointer"
            margkeruser.style.backgroundColor = "white"
            margkeruser.style.borderRadius = "100%"
            margkeruser.className = 'marker';

                              
            //Posicion actual usuario.
            let marker = new mapboxgl.Marker(margkeruser)
                .setLngLat([lng, lat])
                .addTo(map);

            //Tomamos el primer punto de referencia (cordenadas actuales del usuario)
            from = turf.point([lng, lat]);


            let markets = []


            await fetch('https://amigaapp-f2f93-default-rtdb.firebaseio.com/dbrutas.json')
                .then(response => response.json())
                .then(json => {


                    Object.keys(json).forEach(element => {
                        opcionesRuta.push(element)


                    });

                })
                .catch(err => console.log(err))
                .finally(() => {

                    console.log(opcionesRuta)


                })

            //CARGAMOS LOS PUNTOS
            try {
                opcionesRuta.forEach(async (rutaNombre) => {
                    await fetch(`https://amigaapp-f2f93-default-rtdb.firebaseio.com/dbrutas/${rutaNombre}.json`)
                        .then((resp) => resp.json())
                        .then((data) => {

                            let dataPoints = Object.values(data)



                            Array.of(dataPoints[0]).forEach((coordenadas) => {

                                const { Latitude, Longitude, Speed } = coordenadas



                                geojson.features.push(
                                    {
                                        type: 'Feature',
                                        geometry: {
                                            coordinates: {
                                                lat: Latitude,
                                                lon: Longitude
                                            }
                                        },
                                        properties: {
                                            title: 'Ruta 18',
                                            description: 'Norte/Sur',
                                            velocidad: Speed == undefined ? '0' : Speed
                                        }
                                    }
                                )
                            });
                        })
                        .finally(() => {
                            loadPointMap()
                        })

                })

            } catch (err) {
                // If the updateSource interval is defined, clear the interval to stop updating the source.
                // if (updateSource) clearInterval(updateSource);
                throw new Error("Error", err);

            }
        })

        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());


        /* const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map); */


        /**
         * ESCUCHAMOS LA INFORMACION ENVIADA DESDE EL SERVIDOR
         */
        socket.on('chat_send_server_message', (msg) => {
            console.log("recibiendo datos................", msg)
            const { Latitude, Longitude, Speed } = msg.data
            const el = document.createElement('div');

            el.style.width = "42px"
            el.style.height = "42px"
            el.style.backgroundImage = "url('../../assets/iconbus.svg')"
            el.style.backgroundSize = "cover"
            el.style.borderRadius = "50%"
            el.style.cursor = "pointer"

            el.className = 'marker';

            to = turf.point([Longitude, Latitude]);
            let options = { units: 'kilometers' };

            let distance = turf.distance(from, to, options);

            //addToMap
            /* let addToMap = [from, to];
            from.properties.distance = distance;
            to.properties.distance = distance; */

            //Habilitar si solo queremos mostrar la ruta segun la room.

            var popupText = new mapboxgl.Popup({ offset: 25 })
                .setLngLat([Longitude, Latitude])
                .setHTML(`<div><h3>${msg.room.replace('_', ' ').toUpperCase()}</h3>Dirección:<span>Norte - Sur</span><br><span>Velocidad: ${Math.round(Speed * 3.6)} K/h </span><br><span>Distancia: ${Math.round(distance * 1000)} m</span></div>`)
                .addTo(map);


            if (marker != null) {
                marker.remove();
                marker = new mapboxgl.Marker(el)
                    .setLngLat([Longitude, Latitude])
                    .addTo(map)
                    .setPopup(popupText);
            } else {
                marker = new mapboxgl.Marker(el)
                    .setLngLat([Longitude, Latitude])
                    .addTo(map)
                    .setPopup(popupText);
            }

            /**
             * ESTAS PARTE DEL CODIGO SE UTILIZARA PARA MOSTRAR TODAS LAS RUTAS EN EL MAPA.
             * AUN FALTA AJUSTAR UN POCO LA LOGICA POR ESO ESTA COMENTADO
             */
            /*console.log("buscando point", geojson.features)
            geojson.features.forEach((marker, index) => {

                console.log(marker)

                //BUSCAMOS SI YA ESTA GUARDADA LA RUTA                
                if (geojson.features[index].properties.hasOwnProperty('title')) {
                    console.log(geojson.features[index].properties.title.toLowerCase(),msg.room.replace('_', ' ').toLowerCase())
                    if (geojson.features[index].properties.title.toLowerCase() !== msg.room.replace('_', ' ').toLowerCase()) {
                        //ACA ACTUALIZAMOS EL LOS PUNTOS
                        geojson.features.push(
                            {
                                type: 'Feature',
                                geometry: {
                                    coordinates: {
                                        lat: Latitude,
                                        lon: Longitude
                                    }
                                },
                                properties: {
                                    title: msg.room.replace('_', ' ').toUpperCase(),
                                    description: 'Norte/Sur',
                                    velocidad: Speed == undefined ? '0' : Math.round(Speed * 3.6),
                                    distancia: Math.round(distance * 1000)
                                }
                            }
                        ) 
                        
                    } else {
                        //Coordenates                       
                        marker.geometry.coordinates.lat=Latitude
                        marker.geometry.coordinates.lon=Longitude

                        //Descriptcion
                        marker.properties.title = msg.room.replace('_', ' ').toUpperCase(),
                        marker.properties.description ='Norte/Sur',
                        marker.properties.velocidad = Speed == undefined ? '0' : Math.round(Speed * 3.6),
                        marker.properties.distancia = Math.round(distance * 1000)

                        
                    } 
                }
            })


            //Cargamos los puntos en el mapa
            loadPointMap()*/


        });
    }

    loadPointMap = () => {


        const el = document.createElement('div');

        el.style.width = "42px"
        el.style.height = "42px"
        el.style.backgroundImage = "url('../../assets/iconbus.svg')"
        el.style.backgroundSize = "cover"
        el.style.borderRadius = "50%"
        el.style.cursor = "pointer"

        el.className = 'marker';

        //AGEGANDO PUNTOS EN EL MAPA.
        geojson.features.forEach((marker, index) => {
            //POPUP

            var popupText = new mapboxgl.Popup({ offset: 25 })
                .setLngLat([marker.geometry.coordinates.lat, marker.geometry.coordinates.lon])
                .setHTML(`<div><h3>${geojson.features[index].properties.title}</h3><Dirección:<span>${geojson.features[index].properties.description}</span><br><span>Velocidad: ${geojson.features[index].properties.velocidad}</span><br><span>Distancia: ${geojson.features[index].properties.distancia == undefined ? 'N/A' : geojson.features[index].properties.distancia}</span></div>`)
                .addTo(map);


            el.id = `popmarketbus_${index}`

            let pointmarcketr = new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(map)
                .setPopup(popupText);
        });
    }




})

