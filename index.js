let map;
let markers = [];
let activeInfoWindow = null;
let markingEnabled = false;

function initMap() {
    const defaultLocation = { lat: 28.679079, lng: 77.069710};

    map = new google.maps.Map(document.getElementById("google-map"), {
        center: defaultLocation,
        zoom: 13,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
        ],
    });

    getUserLocation();
    setupMapEvents();
    setupControlButtons();
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                map.setCenter(userLocation);
                map.setZoom(15);

                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                });
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                alert(`Geolocation error: ${error.message}. Using default location.`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("Geolocation is not supported by your browser. Using default location.");
    }
}

function setupMapEvents() {
    map.addListener("click", function (event) {
        if (markingEnabled) {
            document.getElementById("location-info").classList.add("active");
            document.getElementById("selected-lat-lng").textContent = `Lat: ${event.latLng.lat().toFixed(6)}, Lng: ${event.latLng.lng().toFixed(6)}`;
            placeMarker(event.latLng);
        }
    });
}

function setupControlButtons() {
    document.getElementById("mark-location").addEventListener("click", function () {
        markingEnabled = !markingEnabled;
        this.classList.toggle("active");
        this.innerHTML = markingEnabled ? "Click on Map" : "Mark Location";
        map.setOptions({ draggableCursor: markingEnabled ? "crosshair" : "grab" });
    });

    document.getElementById("clear-markers").addEventListener("click", function () {
        clearMarkers();
        document.getElementById("saved-locations").innerHTML = "";
        document.getElementById("location-info").classList.remove("active");
    });
}

function placeMarker(location) {
    if (markingEnabled && markers.length > 0) {
        markers[markers.length - 1].setMap(null);
        markers.pop();
    }

    const marker = new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP
    });

    markers.push(marker);
    map.panTo(location);
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    if (activeInfoWindow) {
        activeInfoWindow.close();
        activeInfoWindow = null;
    }
}

// SOS functionality
const sosButton = document.getElementById("sos-button");
sosButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLocation = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
            fetch("http://localhost:3000/send-sos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ location: userLocation })
            })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => console.error("Error sending SOS:", error));
        });
    } else {
        alert("Geolocation not supported by your browser.");
    }
});

// Add emergency contact functionality
document.getElementById("add-contact").addEventListener("click", () => {
    const contactNumber = document.getElementById("contact-number").value;
    if (!contactNumber) {
        alert("Please enter a contact number.");
        return;
    }

    fetch("http://localhost:3000/add-contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ contact: contactNumber })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById("contact-list").innerHTML += `<p>${contactNumber}</p>`;
    })
    .catch(error => console.error("Error adding contact:", error));
});
