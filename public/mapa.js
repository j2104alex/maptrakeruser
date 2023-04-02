window.addEventListener('DOMContentLoaded', () => {
    const appDiv = document.getElementById('app');
    appDiv.style.display="none"
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
            zoom: 14, // starting zoom
            projection: 'globe' // display the map as a 3D globe
        });
        map.on('style.load', () => {
            map.setFog({}); // Set the default atmosphere style
        });
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

        //createMarket(lat, lng,this.map)
        /* const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map); */

        socket.on('chat_send_server_message', (msg) => {
            console.log("datos recibidos",msg)
            const { Latitude, Longitude } = msg
            if (marker != null) {
                marker.remove();
                marker = new mapboxgl.Marker()
                    .setLngLat([Longitude, Latitude])
                    .addTo(map);
            } else {
                marker = new mapboxgl.Marker()
                    .setLngLat([Longitude, Latitude])
                    .addTo(map);
            }

        });
    }



    const createMarket = (lat, lng, map) => {
        // Create a new marker.
        const marker = new mapboxgl.Marker()
            .setLngLat([lat, lng])
            .addTo(map);
    }
})

