window.addEventListener('DOMContentLoaded', () => {
    const appDiv = document.getElementById('app');
    appDiv.style.display = "none"


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
        console.log(lat, lng);

        mapboxgl.accessToken = 'pk.eyJ1IjoiY3J1c3RvMjAyMiIsImEiOiJjbDg3c3lmaTExNmg4M3BubGhyMThvMmhsIn0.AhcG868gRKbP-zDiccuMdA';
        const map = new mapboxgl.Map({
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
            //simulateMarkets()

            let opcionesRuta = []
            //Añadimos markets
            let geojson = {
                "type": "FeatureCollection",
                "features": []
            };

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

                            console.log(Array.of(dataPoints[0]))

                            Array.of(dataPoints[0]).forEach((coordenadas) => {

                                const { Latitude, Longitude, Speed } = coordenadas

                                console.log(Latitude, Longitude, Speed)

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
                                    .setHTML(`<div><h3>${geojson.features[index].properties.title}</h3><br>Dirección:<span>${geojson.features[index].properties.description}</span><br><span>Velocidad: ${geojson.features[index].properties.velocidad}</span></div>`)
                                    .addTo(map);


                                    el.id = `popmarketbus_${index}`

                                let pointmarcketr = new mapboxgl.Marker(el)
                                    .setLngLat(marker.geometry.coordinates)
                                    .addTo(map)
                                    .setPopup(popupText);


                            });


                            console.table(geojson);


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

        //createMarket(lat, lng,this.map)
        /* const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map); */


        /**
         * ESCUCHAMOS LA INFORMACION ENVIADA DESDE EL SERVIDOR
         */
        socket.on('chat_send_server_message', (msg) => {
            console.log("datos recibidos", msg)
            const { Latitude, Longitude, Speed } = msg
            const el = document.createElement('div');

            el.style.width = "42px"
            el.style.height = "42px"
            el.style.backgroundImage = "url('../../assets/iconbus.svg')"
            el.style.backgroundSize = "cover"
            el.style.borderRadius = "50%"
            el.style.cursor = "pointer"
            
            el.className = 'marker';

            var popupText = new mapboxgl.Popup({ offset: 25 })
                                    .setLngLat([Longitude, Latitude])
                                    .setHTML(`<div><h3>DEMO</h3><br>Dirección:<span>Norte - Sur</span><br><span>Velocidad: ${Speed}</span></div>`)
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

        });
    }



    const createMarket = (lat, lng, map) => {
        // Create a new marker.
        const marker = new mapboxgl.Marker()
            .setLngLat([lat, lng])
            .addTo(map);
    }

    async function simulateMarkets() {

    }
})

